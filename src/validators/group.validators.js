import pkg from "express-validator";
const { body, param } = pkg;

const mongoIdParam = (fieldName = "id") =>
  param(fieldName)
    .exists()
    .withMessage(`${fieldName} is required`)
    .isMongoId()
    .withMessage(`${fieldName} must be a valid MongoDB ID`);

const createGroupValidator = () => [
  body("name")
    .exists()
    .withMessage("Name is required")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("description")
    .exists()
    .withMessage("Description is required")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),
];

const joinGroupValidator = () => [
  body("inviteCode")
    .exists()
    .withMessage("Invite code is required")
    .trim()
    .notEmpty()
    .withMessage("Invite code cannot be empty"),
];

const getGroupDetailsValidator = () => [mongoIdParam("groupId")];

const updateGroupValidator = () => [
  mongoIdParam("groupId"),

  body().custom((value, { req }) => {
    if (!req.body.newName && !req.body.newDescription) {
      throw new Error(
        "At least one of newName or newDescription must be provided",
      );
    }
    return true;
  }),

  body("newName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("newName cannot be empty"),

  body("newDescription")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("newDescription cannot be empty"),
];

const deleteGroupValidator = () => [mongoIdParam("groupId")];

const inviteMembersValidator = () => [mongoIdParam("groupId")];

const viewGroupMembersValidator = () => [mongoIdParam("groupId")];

const removeGroupMembersValidator = () => [
  mongoIdParam("groupId"),
  mongoIdParam("userId"),
];

export {
  createGroupValidator,
  joinGroupValidator,
  getGroupDetailsValidator,
  updateGroupValidator,
  deleteGroupValidator,
  inviteMembersValidator,
  viewGroupMembersValidator,
  removeGroupMembersValidator,
};
