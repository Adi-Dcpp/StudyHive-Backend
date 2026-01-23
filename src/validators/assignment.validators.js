import { param, body } from "express-validator";

const createAssignmentValidator = [
  param("goalId").isMongoId().withMessage("Invalid goalId"),

  body("title")
    .isString()
    .withMessage("title must be a string")
    .notEmpty()
    .withMessage("title is required"),

  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string"),

  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("deadline must be a valid date"),

  body("referenceMaterials")
    .optional()
    .isArray()
    .withMessage("referenceMaterials must be an array"),

  body("referenceMaterials.*")
    .optional()
    .isString()
    .withMessage("each reference material must be a string"),
];

const getAssignmentsByGoalValidator = [
  param("goalId").isMongoId().withMessage("Invalid goalId"),
];

const updateAssignmentValidator = [
  param("assignmentId").isMongoId().withMessage("Invalid assignmentId"),

  body("title").optional().isString().withMessage("title must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string"),

  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("deadline must be a valid date"),

  body("referenceMaterials")
    .optional()
    .isArray()
    .withMessage("referenceMaterials must be an array"),

  body("referenceMaterials.*")
    .optional()
    .isString()
    .withMessage("each reference material must be a string"),

  body("maxMarks")
    .optional()
    .isNumeric()
    .withMessage("maxMarks must be a number"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
];

const deleteAssignmentValidator = [
  param("assignmentId").isMongoId().withMessage("Invalid assignmentId"),
];

export {
  createAssignmentValidator,
  getAssignmentsByGoalValidator,
  updateAssignmentValidator,
  deleteAssignmentValidator,
};
