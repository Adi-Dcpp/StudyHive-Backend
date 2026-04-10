import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";
import { Assignment } from "../models/assignment.models.js";
import { Goal } from "../models/goal.models.js";
import { Submission } from "../models/submission.models.js";
import { GroupMember } from "../models/groupMember.models.js";

const getMentorDashboard = asyncHandler(async (req, res) => {
  const mentorId = req.user._id;

  // Mentor's groups from membership records (single source of truth)
  const mentorMemberships = await GroupMember.find({
    user: mentorId,
    role: "mentor",
  })
    .select("group")
    .lean();

  const groupIds = mentorMemberships.map((membership) => membership.group);

  if (groupIds.length === 0) {
    const stats = {
      groups: 0,
      goals: 0,
      assignments: 0,
      submissions: 0,
      learners: 0,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Mentor dashboard fetched successfully", stats),
      );
  }

  // Goals inside groups
  const [goals, learnerIds] = await Promise.all([
    Goal.find({ group: { $in: groupIds } })
      .select("_id")
      .lean(),
    GroupMember.distinct("user", {
      group: { $in: groupIds },
      role: "learner",
    }),
  ]);
  const goalIds = goals.map((g) => g._id);

  if (goalIds.length === 0) {
    const stats = {
      groups: groupIds.length,
      goals: 0,
      assignments: 0,
      submissions: 0,
      learners: learnerIds.length,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Mentor dashboard fetched successfully", stats),
      );
  }

  // Assignments inside goals
  const assignments = await Assignment.find({ goalId: { $in: goalIds } })
    .select("_id")
    .lean();
  const assignmentIds = assignments.map((a) => a._id);

  if (assignmentIds.length === 0) {
    const stats = {
      groups: groupIds.length,
      goals: goals.length,
      assignments: 0,
      submissions: 0,
      learners: learnerIds.length,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Mentor dashboard fetched successfully", stats),
      );
  }

  const [submissions, recentSubmissions, recentAssignments] =
    await Promise.all([
      Submission.countDocuments({
        assignmentId: { $in: assignmentIds },
      }),
      Submission.find({
        assignmentId: { $in: assignmentIds },
      })
        .populate("userId", "name email")
        .populate("assignmentId", "title")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Assignment.find({
        goalId: { $in: goalIds },
      })
        .select("title deadline createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

  const stats = {
    groups: groupIds.length,
    goals: goals.length,
    assignments: assignments.length,
    submissions,
    learners: learnerIds.length,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Mentor dashboard fetched successfully",
        { ...stats, recentSubmissions, recentAssignments },
      ),
    );
});

export { getMentorDashboard };
