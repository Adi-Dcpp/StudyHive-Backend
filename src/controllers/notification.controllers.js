import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/notification.models.js";
import mongoose from "mongoose";
import { getPaginatedData } from "../utils/pagination.utils.js";

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const filter = {
    recipient: userId,
  };

  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === "true";
  }

  const total = await Notification.countDocuments(filter);

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  res.status(200).json(
    new ApiResponse(200, "Notifications retrieved successfully", {
      notifications,
      unreadCount,
      pagination,
    }),
  );
});

const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notificationId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification ID");
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    {
      isRead: true,
    },
    {
      new: true,
    },
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Notification marked as read", {
      notification,
    }),
  );
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      isRead: true,
    },
  );

  res.status(200).json(
    new ApiResponse(200, "All notifications marked as read", {
      modifiedCount: result.modifiedCount,
    }),
  );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const notificationId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification ID");
  }

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(
    new ApiResponse(200, "Notification deleted successfully"),
  );
});

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};