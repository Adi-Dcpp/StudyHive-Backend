import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";
import { Assignment } from "../models/assignment.models.js";
import { Goal } from "../models/goal.models.js";
import { Group } from "../models/group.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import { getPaginatedData } from "../utils/pagination.utils.js";

const createAssignment = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { title, description, deadline, referenceMaterials } = req.body;
  const { _id: userId } = req.user;

  const goal = await Goal.findById(goalId);

  if (!goal) {
    throw new ApiError(404, "Failed to get the goal");
  }

  const groupId = goal.group;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Failed to get the group");
  }

  const mentorMembership = await GroupMember.findOne({
    group: groupId,
    user: userId,
    role: "mentor",
  });

  if (!mentorMembership) {
    throw new ApiError(403, "User not authorized to create assignment");
  }

  const assignment = await Assignment.create({
    title,
    description,
    goalId,
    groupId,
    createdBy: userId,
    deadline,
    referenceMaterials,
  });

  if (!assignment) {
    throw new ApiError(400, "Failed to create assignment");
  }

  return res.status(201).json(
    new ApiResponse(201, "Assignment created successfully", {
      title: assignment.title,
      deadline: assignment.deadline,
    }),
  );
});

const getAssignmentsByGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const { _id: userId } = req.user;

  const goal = await Goal.findById(goalId);
  if (!goal) {
    throw new ApiError(404, "Goal not found");
  }

  const isMember = await GroupMember.exists({
    group: goal.group,
    user: userId,
  });

  if (!isMember) {
    throw new ApiError(403, "Not authorized to view assignments");
  }

  const query = { goalId, isActive: true };

  const total = await Assignment.countDocuments(query);

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  if (!total) {
    return res.status(200).json(
      new ApiResponse(200, "No assignments found for the goal", {
        assignments: [],
        pagination,
      })
    );
  }

  const assignments = await Assignment.find(query)
    .select("title deadline")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, "Assignment data fetched successfully", {
      assignments,
      pagination,
    })
  );
});

const updateAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const {
    title,
    description,
    deadline,
    referenceMaterials,
    maxMarks,
    isActive,
  } = req.body;
  const { _id: userId } = req.user;

  if (
    title === undefined &&
    description === undefined &&
    deadline === undefined &&
    referenceMaterials === undefined &&
    maxMarks === undefined &&
    isActive === undefined
  ) {
    throw new ApiError(400, "At least one field must be updated");
  }

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(404, "Failed to get assignment");
  }

  if (!assignment.createdBy.equals(userId)) {
    throw new ApiError(403, "User not authorized to update assignment");
  }

  if (title) {
    assignment.title = title;
  }

  if (description) {
    assignment.description = description;
  }

  if (deadline) {
    assignment.deadline = deadline;
  }

  if (referenceMaterials) {
    assignment.referenceMaterials = referenceMaterials;
  }

  if (maxMarks !== undefined) {
    assignment.maxMarks = maxMarks;
  }

  if (isActive !== undefined) {
    assignment.isActive = isActive;
  }

  await assignment.save();

  return res.status(200).json(
    new ApiResponse(200, "Assignment updated successfully", {
      title: assignment.title,
      deadline: assignment.deadline,
    }),
  );
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { _id: userId } = req.user;

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    throw new ApiError(404, "Failed to get assignment");
  }

  if (!assignment.createdBy.equals(userId)) {
    throw new ApiError(403, "User not authorized to delete assignment");
  }

  assignment.isActive = false;
  await assignment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Assignment deleted successfully", {}));
});

export {
  createAssignment,
  getAssignmentsByGoal,
  updateAssignment,
  deleteAssignment,
};
