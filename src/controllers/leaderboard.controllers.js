import mongoose from "mongoose";
import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";
import { GroupMember } from "../models/groupMember.models.js";
import { Goal } from "../models/goal.models.js";
import { Assignment } from "../models/assignment.models.js";
import { Submission } from "../models/submission.models.js";

const getMyProgress = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const userId = req.user._id;

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

  const goalsAssigned = await Goal.countDocuments({
    group: groupId,
    assignedTo: userId,
  });

  const goalsCompleted = await Goal.countDocuments({
    group: groupId,
    assignedTo: userId,
    status: "completed",
  });

  const assignments = await Assignment.find({
    groupId,
    isActive: true,
  }).select("_id maxMarks");

  const assignmentIds = assignments.map((assignment) => assignment._id);

  const submissions = await Submission.find({
    assignmentId: {
      $in: assignmentIds,
    },
    userId,
  });

  const assignmentsSubmitted = submissions.length;

  const pendingAssignments = assignments.length - assignmentsSubmitted;

  const reviewedSubmissions = submissions.filter(
    (submission) => submission.status === "reviewed",
  ).length;

  const revisionRequests = submissions.filter(
    (submission) => submission.status === "revision_required",
  ).length;

  let totalMarksObtained = 0;

  let totalMaxMarks = 0;

  submissions.forEach((submission) => {
    if (submission.status === "reviewed") {
      const assignment = assignments.find(
        (a) => a._id.toString() === submission.assignmentId.toString(),
      );

      if (assignment) {
        totalMarksObtained += submission.marksObtained || 0;

        totalMaxMarks += assignment.maxMarks || 0;
      }
    }
  });

  const averageScore =
    totalMaxMarks > 0
      ? Number(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2))
      : 0;

  res.status(200).json(
    new ApiResponse(200, "Progress retrieved successfully", {
      progress: {
        goalsAssigned,
        goalsCompleted,
        assignmentsSubmitted,
        pendingAssignments,
        reviewedSubmissions,
        revisionRequests,
        averageScore,
      },
    }),
  );
});

export { getMyProgress };
