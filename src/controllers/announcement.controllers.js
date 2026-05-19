import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";
import { User } from "../models/user.models.js";
import { Group } from "../models/group.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import { Announcement } from "../models/announcement.models.js";
import { getPaginatedData } from "../utils/pagination.utils.js";
import mongoose from "mongoose";
import { createManyNotifications } from "../services/notification.services.js";

const createAnnouncement = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { title, body } = req.body;
  const { _id: userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  if (!title || !body) {
    throw new ApiError(400, "Title and body are required");
  }

  if (title.trim() === "" || body.trim() === "") {
    throw new ApiError(400, "Title and body cannot be empty");
  }

  if (title.length > 200) {
    throw new ApiError(400, "Title cannot exceed 200 characters");
  }

  if (body.length > 2000) {
    throw new ApiError(400, "Body cannot exceed 2000 characters");
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const membership = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!membership) {
    throw new ApiError(403, "User is not a member of this group");
  }

  if (membership.role !== "mentor") {
    throw new ApiError(403, "Only mentors can create announcements");
  }

  const announcement = await Announcement.create({
    title,
    body,
    group: groupId,
    createdBy: userId,
  });

  const members = await GroupMember.find({
    group: groupId,
  }).select("user");

  const notifications = members
    .filter((member) => !member.user.equals(userId))
    .map((member) => ({
      recipient: member.user,
      type: "new_announcement",
      title: "New Announcement",
      body: `New announcement posted in ${group.name}: "${announcement.title}"`,
      refId: announcement._id,
      refModel: "Announcement",
    }));

  if (notifications.length > 0) {
    try {
      await createManyNotifications(notifications);
    } catch (error) {
      console.error("Failed to create announcement notifications:", error);
    }
  }

  return res.status(201).json(
    new ApiResponse(201, "Announcement created successfully", {
      id: announcement._id,
      title: announcement.title,
      body: announcement.body,
      group: announcement.group,
      createdBy: announcement.createdBy,
      createdAt: announcement.createdAt,
    }),
  );
});

const getAnnouncement = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { _id: userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const membership = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!membership) {
    throw new ApiError(403, "User is not a member of this group");
  }

  const query = { group: groupId };
  const total = await Announcement.countDocuments(query);

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  if (!total) {
    return res.status(200).json(
      new ApiResponse(200, "Announcements retrieved successfully", {
        announcements: [],
        pagination,
      }),
    );
  }

  const announcements = await Announcement.find(query)
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json(
    new ApiResponse(200, "Announcements retrieved successfully", {
      announcements: announcements.map((announcement) => ({
        id: announcement._id,
        title: announcement.title,
        body: announcement.body,
        group: announcement.group,
        createdBy: announcement.createdBy,
        createdAt: announcement.createdAt,
        isPinned: announcement.isPinned,
      })),
      pagination,
    }),
  );
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  const { title, body, isPinned } = req.body;
  const { _id: userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(announcementId)) {
    throw new ApiError(400, "Invalid announcement ID");
  }

  const announcement = await Announcement.findById(announcementId);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  const membership = await GroupMember.findOne({
    group: announcement.group,
    user: userId,
  });

  if (!membership) {
    throw new ApiError(403, "User is not a member of this group");
  }

  if (membership.role !== "mentor") {
    throw new ApiError(403, "Only mentors can update announcements");
  }

  if (announcement.createdBy.toString() !== userId.toString()) {
    throw new ApiError(403, "Only the creator can update this announcement");
  }

  announcement.title = title || announcement.title;
  announcement.body = body || announcement.body;
  if (isPinned !== undefined) {
    announcement.isPinned = isPinned;
  }
  await announcement.save();

  return res.status(200).json(
    new ApiResponse(200, "Announcement updated successfully", {
      id: announcement._id,
      title: announcement.title,
      body: announcement.body,
      group: announcement.group,
      createdBy: announcement.createdBy,
      createdAt: announcement.createdAt,
      isPinned: announcement.isPinned,
    }),
  );
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  const { _id: userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(announcementId)) {
    throw new ApiError(400, "Invalid announcement ID");
  }

  const announcement = await Announcement.findById(announcementId);

  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  
  if(announcement.createdBy.toString() !== userId.toString()){
    throw new ApiError(403, "Only the creator can delete this announcement");
  }

  const membership = await GroupMember.findOne({
    group: announcement.group,
    user: userId,
  });

  if (!membership) {
    throw new ApiError(403, "User is not a member of this group");
  }

  if (membership.role !== "mentor") {
    throw new ApiError(403, "Only mentors can delete announcements");
  }

  await announcement.delete();

  return res.status(200).json(
    new ApiResponse(200, "Announcement deleted successfully", {
      id: announcement._id,
    }),
  );
});

export {
  createAnnouncement,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
