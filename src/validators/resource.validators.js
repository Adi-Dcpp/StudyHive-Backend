import { body, param, query } from "express-validator";
import mongoose from "mongoose";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const uploadResourceValidator = () => [
  param("groupId").custom(isValidObjectId).withMessage("Invalid groupId"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),

  body("type")
    .notEmpty()
    .withMessage("Resource type is required")
    .isIn(["file", "link", "note"])
    .withMessage("Invalid resource type"),

  body("description")
    .if(body("type").equals("note"))
    .notEmpty()
    .withMessage("Description is required for note type")
    .isLength({ max: 1000 })
    .withMessage("Description must be under 1000 characters"),

  body("linkUrl")
    .if(body("type").equals("link"))
    .notEmpty()
    .withMessage("linkUrl is required for link type")
    .isURL()
    .withMessage("linkUrl must be a valid URL"),
];

const getResourcesValidator = () => [
  param("groupId").custom(isValidObjectId).withMessage("Invalid groupId"),

  query("sortBy")
    .optional()
    .isIn(["recent", "oldest", "title"])
    .withMessage("Invalid sortBy value"),

  query("type")
    .optional()
    .isIn(["file", "link", "note"])
    .withMessage("Invalid resource type"),
];

const deleteResourceValidator = () => [
  param("resourceId").custom(isValidObjectId).withMessage("Invalid resourceId"),
];

export {
  uploadResourceValidator,
  getResourcesValidator,
  deleteResourceValidator,
};
