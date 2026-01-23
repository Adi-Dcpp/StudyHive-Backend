import { asyncHandler } from "../utils/async-handler.utils.js";
import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { Group } from "../models/group.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import { Goal } from "../models/goal.models.js";

const createGoal = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { title, description, assignedTo } = req.body;
  const { _id: userId } = req.user;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.mentor.equals(userId)) {
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

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const isMentor = group.mentor.equals(userId);

  const isAssignedLearner = await Goal.exists({
    group: groupId,
    assignedTo: userId,
  });

  if (!isMentor && !isAssignedLearner) {
    throw new ApiError(
      403,
      "User is not authorised to view goals of this group",
    );
  }

  const goals = await Goal.find({ group: groupId })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, "Goals fetched successfully", goals));
});

const getMyGoals = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  const goals = await Goal.find({ assignedTo: userId })
    .populate("group", "name email")
    .populate("createdBy", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, "My goals fetched successfully", goals));
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

  if (!group || !group.mentor.equals(userId)) {
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

  const goal = await Goal.findById(goalId);

  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  const group = await Group.findById(goal.group);

  if (!group || !group.mentor.equals(userId)) {
    throw new ApiError(403, "User not authorized to delete this goal");
  }

  await goal.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "Goal deleted successfully"));
});

export { createGoal, getGoalsByGroup, getMyGoals, updateGoal, deleteGoal };
