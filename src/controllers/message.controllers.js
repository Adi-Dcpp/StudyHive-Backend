import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";
import { getPaginatedData } from "../utils/pagination.utils.js";
import { createManyNotifications } from "../services/notification.services.js";
import { Message } from "../models/message.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import { Group } from "../models/group.models.js";
import mongoose from "mongoose";

const sendMessage = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;
  const { _id: userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Message content cannot be empty");
  }

  if (content.length > 2000) {
    throw new ApiError(400, "Message content cannot exceed 2000 characters");
  }

  const membership = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!membership) {
    throw new ApiError(403, "You are not a member of this group");
  }

  const message = await Message.create({
    sender: userId,
    group: groupId,
    content,
  });

  if (!message) {
    throw new ApiError(500, "Failed to send message");
  }

  const receivers = await GroupMember.find({
    group: groupId,
    user: { $ne: userId },
  })
    .select("user")
    .lean();

  const group = await Group.findById(groupId).select("name").lean();

  const notifications = receivers.map((r) => ({
    recipient: r.user,
    type: "group_message",
    title: `${req.user.name} sent a new message in ${group.name}`,
    body: content.length > 100 ? content.substring(0, 100) + "..." : content,
    refId: message._id,
    refModel: "Message",
  }));

  if (notifications.length > 0) {
    try {
      await createManyNotifications(notifications);
    } catch (error) {
      console.error("Failed to create message notifications:", error);
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Message sent successfully", message));
});

const getGroupMessages = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { _id: userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const membership = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!membership) {
    throw new ApiError(403, "You are not a member of this group");
  }

  const filter = {
    group: groupId,
    deletedAt: null,
  };

  const total = await Message.countDocuments(filter);

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  const messages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "name email")
    .lean();

  res.status(200).json(
    new ApiResponse(200, "Messages retrieved successfully", {
      messages,
      pagination,
    }),
  );
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message ID");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (!message.sender.equals(userId)) {
    throw new ApiError(
      403,
      "You can only delete your own messages",
    );
  }

  if (message.deletedAt) {
    throw new ApiError(
      400,
      "Message already deleted",
    );
  }

  message.deletedAt = new Date();

  await message.save();

  res.status(200).json(
    new ApiResponse(
      200,
      "Message deleted successfully",
    ),
  );
});

export {
  sendMessage,
  getGroupMessages,
  deleteMessage,
};