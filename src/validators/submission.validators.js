import { param, body } from "express-validator";

const submitAssignmentValidator = [
  param("assignmentId").isMongoId().withMessage("Invalid assignmentId"),

  body("submittedText")
    .optional()
    .isString()
    .withMessage("submittedText must be a string")
    .notEmpty()
    .withMessage("submittedText cannot be empty"),
];

const reviewSubmissionValidator = [
  param("submissionId").isMongoId().withMessage("Invalid submissionId"),

  body("status")
    .isIn(["reviewed", "revision_required"])
    .withMessage("Invalid review status"),

  body("marksObtained")
    .optional()
    .isNumeric()
    .withMessage("marksObtained must be a number"),

  body("feedback")
    .optional()
    .isString()
    .withMessage("feedback must be a string"),
];

const getSubmissionsByAssignmentValidator = [
  param("assignmentId").isMongoId().withMessage("Invalid assignmentId"),
];

export {
  submitAssignmentValidator,
  reviewSubmissionValidator,
  getSubmissionsByAssignmentValidator,
};
