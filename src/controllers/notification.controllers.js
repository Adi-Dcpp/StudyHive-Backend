import { ApiResponse } from "../utils/api-response.utils.js";
import { ApiError } from "../utils/api-error.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";

import { Notification } from "../models/notification.models.js";

import mongoose from "mongoose";

const getNotifications = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  const notifications = await Notification.find({
    recipient: userId,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const unreadCount = notifications.length;

  res.status(200).json(
    new ApiResponse(
      200,
      "Notifications retrieved successfully",
      {
        notifications,
        unreadCount,
      },
    ),
  );

});

const deleteNotification = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  const notificationId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {

    throw new ApiError(
      400,
      "Invalid notification ID",
    );

  }

  const notification =
    await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

  if (!notification) {

    throw new ApiError(
      404,
      "Notification not found",
    );

  }

  res.status(200).json(
    new ApiResponse(
      200,
      "Notification deleted successfully",
    ),
  );

});

const clearAllNotifications = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  const result = await Notification.deleteMany({
    recipient: userId,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      "All notifications cleared successfully",
      {
        deletedCount: result.deletedCount,
      },
    ),
  );

});

export {
  getNotifications,
  deleteNotification,
  clearAllNotifications,
};