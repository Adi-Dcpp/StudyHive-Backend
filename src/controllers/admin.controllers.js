import mongoose from "mongoose";

import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";
import { getPaginatedData } from "../utils/pagination.utils.js";

import { User } from "../models/user.models.js";
import { Group } from "../models/group.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import { Goal } from "../models/goal.models.js";
import { Assignment } from "../models/assignment.models.js";
import { Submission } from "../models/submission.models.js";
import { Announcement } from "../models/announcement.models.js";
import { Notification } from "../models/notification.models.js";

const VALID_ROLES = ["admin", "mentor", "learner"];

const listUsers = asyncHandler(async (req, res) => {
  const { role, isEmailVerified, search } = req.query;

  const filter = {};

  if (role) {
    if (!VALID_ROLES.includes(role)) {
      throw new ApiError(400, "Invalid role filter");
    }

    filter.role = role;
  }

  if (isEmailVerified !== undefined) {
    filter.isEmailVerified = isEmailVerified === "true";
  }

  if (search) {
    filter.$or = [
      {
        fullname: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const total = await User.countDocuments(filter);

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json(
    new ApiResponse(200, "Users retrieved successfully", {
      users,
      pagination,
    }),
  );
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId)
    .select("-password -refreshToken")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const membershipsCount = await GroupMember.countDocuments({
    user: userId,
  });

  res.status(200).json(
    new ApiResponse(200, "User retrieved successfully", {
      ...user,
      membershipsCount,
    }),
  );
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!VALID_ROLES.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      role,
    },
    {
      new: true,
    },
  )
    .select("-password -refreshToken")
    .lean();

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User role updated successfully", updatedUser));
});

const suspendUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      isSuspended: true,
      refreshToken: null,
    },
    {
      new: true,
    },
  )
    .select("-password -refreshToken")
    .lean();

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User suspended successfully", updatedUser));
});

const unsuspendUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      isSuspended: false,
    },
    {
      new: true,
    },
  )
    .select("-password -refreshToken")
    .lean();

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "User unsuspended successfully", updatedUser));
});

const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await GroupMember.deleteMany({
    user: userId,
  });

  await Submission.updateMany(
    {
      userId,
    },
    {
      deletedByAdmin: true,
    },
  );

  await Notification.deleteMany({
    recipient: userId,
  });

  await User.findByIdAndDelete(userId);

  res.status(200).json(new ApiResponse(200, "User deleted successfully"));
});

const listGroups = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const filter = {};

  if (search) {
    filter.name = {
      $regex: search,
      $options: "i",
    };
  }

  const total = await Group.countDocuments(filter);

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  const groups = await Group.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json(
    new ApiResponse(200, "Groups retrieved successfully", {
      groups,
      pagination,
    }),
  );
});

const forceDeleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const assignments = await Assignment.find({
    groupId,
  }).select("_id");

  const assignmentIds = assignments.map((assignment) => assignment._id);

  await GroupMember.deleteMany({
    group: groupId,
  });

  await Goal.deleteMany({
    group: groupId,
  });

  await Submission.deleteMany({
    assignmentId: {
      $in: assignmentIds,
    },
  });

  await Assignment.deleteMany({
    groupId,
  });

  await Announcement.deleteMany({
    group: groupId,
  });

  await Group.findByIdAndDelete(groupId);

  res.status(200).json(new ApiResponse(200, "Group deleted successfully"));
});

const getPlatformStats = asyncHandler(async (_, res) => {
  const [
    totalUsers,
    verifiedUsers,
    suspendedUsers,
    totalGroups,
    totalGoals,
    totalAssignments,
    totalSubmissions,
    reviewedSubmissions,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({
      isEmailVerified: true,
    }),

    User.countDocuments({
      isSuspended: true,
    }),

    Group.countDocuments(),

    Goal.countDocuments(),

    Assignment.countDocuments(),

    Submission.countDocuments(),

    Submission.countDocuments({
      status: "reviewed",
    }),
  ]);

  res.status(200).json(
    new ApiResponse(200, "Platform stats retrieved successfully", {
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      totalGroups,
      totalGoals,
      totalAssignments,
      totalSubmissions,
      reviewedSubmissions,
    }),
  );
});

export {
  listUsers,
  getUserById,
  updateUserRole,
  suspendUser,
  unsuspendUser,
  deleteUser,
  listGroups,
  forceDeleteGroup,
  getPlatformStats,
};
