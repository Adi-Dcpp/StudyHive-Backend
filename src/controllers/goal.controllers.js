import { asyncHandler } from "../utils/async-handler.utils.js";
import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { Group } from "../models/group.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import { Goal } from "../models/goal.models.js";
import { getPaginatedData } from "../utils/pagination.utils.js";
import { Assignment } from "../models/assignment.models.js";
import { Submission } from "../models/submission.models.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const createGoal = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { title, description, assignedTo } = req.body;
  const { _id: userId } = req.user;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const mentorMembership = await GroupMember.findOne({
    group: groupId,
    user: userId,
    role: "mentor",
  });

  if (!mentorMembership) {
    throw new ApiError(403, "User is not authorised to create new goal");
  }

  if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
    throw new ApiError(
      400,
      "At least one valid user must be assigned to the goal",
    );
  }

  const groupMembers = await GroupMember.find({ group: groupId }).select(
    "user",
  );
  const memberIds = groupMembers.map((m) => m.user.toString());

  const allAssignedAreMembers = assignedTo.every((id) =>
    memberIds.includes(id.toString()),
  );

  if (!allAssignedAreMembers) {
    throw new ApiError(
      400,
      "One or more assigned users are not part of this group",
    );
  }

  const goal = await Goal.create({
    title,
    description,
    assignedTo,
    createdBy: userId,
    group: groupId,
  });

  return res.status(201).json(
    new ApiResponse(201, "New goal created successfully", {
      title: goal.title,
      createdBy: goal.createdBy,
    }),
  );
});

const getGoalsByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { _id: userId } = req.user;

  const groupExists = await Group.exists({ _id: groupId });
  if (!groupExists) {
    throw new ApiError(404, "Group not found");
  }

  const isMentor = await GroupMember.exists({
    group: groupId,
    user: userId,
    role: "mentor",
  });

  const query = isMentor
    ? { group: groupId }
    : { group: groupId, assignedTo: userId };

  if (!isMentor) {
    const isMember = await GroupMember.exists({
      group: groupId,
      user: userId,
    });

    if (!isMember) {
      throw new ApiError(
        403,
        "User is not authorised to view goals of this group",
      );
    }
  }

  const total = await Goal.countDocuments(query);

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  if (!total) {
    return res.status(200).json(
      new ApiResponse(200, "No Goals found", {
        goals: [],
        pagination,
      }),
    );
  }

  const goals = await Goal.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, "Goals fetched successfully", {
      goals,
      pagination,
    }),
  );
});

const getMyGoals = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  const query = { assignedTo: userId };
  
  const total = await Goal.countDocuments(query);

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  if (!total) {
    return res.status(200).json(
      new ApiResponse(200, "No Goals assigned to you yet", {
        goals: [],
        pagination,
      })
    );
  }

  const goals = await Goal.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("group", "name")
    .populate("createdBy", "name email")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, "My goals fetched successfully", {
      goals,
      pagination,
    })
  );
});

const updateGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { title, description, status, assignedTo } = req.body;
  const { _id: userId } = req.user;

  const goal = await Goal.findById(goalId);

  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  const group = await Group.findById(goal.group);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const mentorMembership = await GroupMember.findOne({
    group: group._id,
    user: userId,
    role: "mentor",
  });

  if (!mentorMembership) {
    throw new ApiError(403, "User not authorized to update this goal");
  }

  if (!title && !description && !status && !assignedTo) {
    throw new ApiError(400, "At least one field must be updated");
  }

  if (assignedTo) {
    if (!Array.isArray(assignedTo) || assignedTo.length === 0) {
      throw new ApiError(400, "Assigned users cannot be empty");
    }

    const groupMembers = await GroupMember.find({ group: group._id }).select(
      "user",
    );
    const memberIds = groupMembers.map((m) => m.user.toString());

    const allAssignedAreMembers = assignedTo.every((id) =>
      memberIds.includes(id.toString()),
    );

    if (!allAssignedAreMembers) {
      throw new ApiError(
        400,
        "One or more assigned users are not part of this group",
      );
    }

    goal.assignedTo = assignedTo;
  }

  if (title) goal.title = title;
  if (description) goal.description = description;
  if (status) goal.status = status;

  await goal.save();

  return res.status(200).json(
    new ApiResponse(200, "Goal updated successfully", {
      title: goal.title,
      createdBy: goal.createdBy,
    }),
  );
});

const deleteGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { _id: userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    throw new ApiError(400, "Invalid goal ID");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const goal = await Goal.findById(goalId);

  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  const isMentor = await GroupMember.exists({
    group: goal.group,
    user: userId,
    role: "mentor",
  });

  if (!isMentor) {
    throw new ApiError(
      403,
      "User not authorized to delete this goal",
    );
  }

  const assignments = await Assignment.find({
    goalId: goal._id,
  }).select("_id");

  const assignmentIds = assignments.map(
    (assignment) => assignment._id,
  );

  let submissions = [];

  if (assignmentIds.length > 0) {
    submissions = await Submission.find({
      assignmentId: {
        $in: assignmentIds,
      },
    }).select("cloudinaryPublicId");
  }

  const submissionPublicIds = submissions
    .filter((submission) => submission.cloudinaryPublicId)
    .map((submission) => submission.cloudinaryPublicId);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (assignmentIds.length > 0) {
      await Submission.deleteMany(
        {
          assignmentId: {
            $in: assignmentIds,
          },
        },
        { session },
      );
    }

    await Assignment.deleteMany(
      {
        goalId: goal._id,
      },
      { session },
    );

    await Goal.deleteOne(
      {
        _id: goal._id,
      },
      { session },
    );

    await session.commitTransaction();
    try {
      await Promise.all(
        submissionPublicIds.map((id) =>
          cloudinary.uploader.destroy(id, { resource_type: "raw" }),
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete some submission files from Cloudinary:",
        err,
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        "Goal and all related data deleted successfully",
        null,
      ),
    );
  } catch (error) {
    await session.abortTransaction();

    throw new ApiError(
      500,
      error.message || "Failed to delete goal",
    );
  } finally {
    session.endSession();
  }
});

export { createGoal, getGoalsByGroup, getMyGoals, updateGoal, deleteGoal };
