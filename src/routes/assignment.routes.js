import { Router } from "express";
import {
  submitAssignment,
  reviewSubmission,
  getSubmissionsByAssignment,
} from "../controllers/submission.controllers.js";
import {
  submitAssignmentValidator,
  reviewSubmissionValidator,
  getSubmissionsByAssignmentValidator,
} from "../validators/submission.validators.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middlewares.js";
import validate from "../middlewares/validators.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post(
  "/assignments/:assignmentId/submit",
  verifyJwt,
  authorizeRoles("learner"),
  upload.single("file"),
  submitAssignmentValidator,
  validate,
  submitAssignment
);

router.put(
  "/submissions/:submissionId/review",
  verifyJwt,
  authorizeRoles("mentor"),
  reviewSubmissionValidator,
  validate,
  reviewSubmission
);

router.get(
  "/assignments/:assignmentId/submissions",
  verifyJwt,
  authorizeRoles("mentor"),
  getSubmissionsByAssignmentValidator,
  validate,
  getSubmissionsByAssignment
);

export default router;
