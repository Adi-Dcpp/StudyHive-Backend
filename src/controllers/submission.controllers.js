import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";
import { Assignment } from "../models/assignment.models.js";
import { Group } from "../models/group.models.js";
import { Submission } from "../models/submission.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";

const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { submittedText } = req.body;
  const { _id: userId } = req.user;

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment || !assignment.isActive) {
    throw new ApiError(404, "Assignment not found or inactive");
  }

  if (assignment.deadline && new Date() > assignment.deadline) {
    throw new ApiError(403, "Assignment submission deadline has passed");
  }

  const group = await Group.findById(assignment.groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const isMember = group.members.some((memberId) => memberId.equals(userId));

  if (!isMember) {
    throw new ApiError(403, "User not authorized to submit this assignment");
  }

  if (!req.file && !submittedText) {
    throw new ApiError(400, "Either file or text submission is required");
  }

  let submission = await Submission.findOne({
    assignmentId,
    userId,
  });

  if (submission) {
    if (submission.status !== "revision_required") {
      throw new ApiError(400, "Assignment already submitted");
    }
  }

  let fileUrl;
  if (req.file) {
    fileUrl = await uploadToCloudinary(req.file.path);
  }

  if (!submission) {
    submission = await Submission.create({
      assignmentId,
      userId,
      submittedFile: fileUrl,
      submittedText,
      status: "submitted",
      submittedAt: new Date(),
    });
  } else {
    submission.submittedFile = fileUrl ?? submission.submittedFile;
    submission.submittedText = submittedText ?? submission.submittedText;
    submission.status = "submitted";
    submission.submittedAt = new Date();
    await submission.save();
  }

  return res.status(201).json(
    new ApiResponse(201, "Assignment submitted successfully", {
      submissionId: submission._id,
      status: submission.status,
    }),
  );
});

const reviewSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { status, feedback, marksObtained } = req.body;
  const { _id: userId } = req.user;

  if (!["reviewed", "revision_required"].includes(status)) {
    throw new ApiError(400, "Invalid review status");
  }

  const submission = await Submission.findById(submissionId);

  if (!submission) {
    throw new ApiError(404, "Submission not found");
  }

  if (submission.status !== "submitted") {
    throw new ApiError(400, "Submission is not in a reviewable state");
  }

  const assignment = await Assignment.findById(submission.assignmentId);

  if (!assignment || !assignment.isActive) {
    throw new ApiError(404, "Assignment not found or inactive");
  }

  const group = await Group.findById(assignment.groupId);

  if (!group || !group.mentor.equals(userId)) {
    throw new ApiError(403, "User not authorized to review this submission");
  }

  submission.status = status;
  submission.feedback = feedback ?? submission.feedback;
  submission.marksObtained =
    marksObtained !== undefined ? marksObtained : submission.marksObtained;
  submission.reviewedAt = new Date();

  await submission.save();

  return res.status(200).json(
    new ApiResponse(200, "Submission reviewed successfully", {
      submissionId: submission._id,
      status: submission.status,
      reviewedAt: submission.reviewedAt,
    }),
  );
});

const getSubmissionsByAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { _id: userId } = req.user;

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment || !assignment.isActive) {
    throw new ApiError(404, "Assignment not found or inactive");
  }

  const group = await Group.findById(assignment.groupId);

  if (!group || !group.mentor.equals(userId)) {
    throw new ApiError(403, "User not authorized to view submissions");
  }

  const submissions = await Submission.find({
    assignmentId,
  })
    .populate("userId", "name email")
    .select("userId status submittedAt reviewedAt marksObtained feedback")
    .sort({ submittedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, "Submissions fetched successfully", {
      count: submissions.length,
      submissions,
    }),
  );
});
export { submitAssignment, reviewSubmission, getSubmissionsByAssignment };
