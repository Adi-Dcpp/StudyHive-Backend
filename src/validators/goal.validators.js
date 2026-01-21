import { body, param } from "express-validator";

export const createGoalValidator = () => {
  return [
    param("groupId")
      .notEmpty()
      .withMessage("Group ID is required")
      .isMongoId()
      .withMessage("Invalid Group ID"),

    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isString()
      .withMessage("Title must be a string"),

    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),

    body("assignedTo")
      .isArray({ min: 1 })
      .withMessage("AssignedTo must be a non-empty array"),

    body("assignedTo.*")
      .isMongoId()
      .withMessage("Each assigned user must be a valid user ID"),
  ];
};

export const updateGoalValidator = () => {
  return [
    param("goalId")
      .notEmpty()
      .withMessage("Goal ID is required")
      .isMongoId()
      .withMessage("Invalid Goal ID"),

    body()
      .custom((value) => {
        const allowedFields = ["title", "description", "status", "assignedTo"];
        return Object.keys(value).some((key) =>
          allowedFields.includes(key)
        );
      })
      .withMessage("At least one field must be updated"),

    body("title")
      .optional()
      .isString()
      .withMessage("Title must be a string")
      .notEmpty()
      .withMessage("Title cannot be empty"),

    body("description")
      .optional()
      .isString()
      .withMessage("Description must be a string"),

    body("status")
      .optional()
      .isIn(["not_started", "ongoing", "completed"])
      .withMessage("Invalid goal status"),

    body("assignedTo")
      .optional()
      .isArray({ min: 1 })
      .withMessage("AssignedTo must be a non-empty array"),

    body("assignedTo.*")
      .optional()
      .isMongoId()
      .withMessage("Each assigned user must be a valid user ID"),
  ];
};

export const groupIdParamValidator = () => {
  return [
    param("groupId")
      .notEmpty()
      .withMessage("Group ID is required")
      .isMongoId()
      .withMessage("Invalid Group ID"),
  ];
};
