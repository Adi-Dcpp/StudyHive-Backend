import { Router } from "express";
import {
  createGroup,
  joinGroup,
  viewAllJoinedGroup,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  inviteMembers,
  viewGroupMembers,
  removeGroupMembers,
} from "../controllers/group.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";

import {
  createGroupValidator,
  joinGroupValidator,
  getGroupDetailsValidator,
  updateGroupValidator,
  deleteGroupValidator,
  inviteMembersValidator,
  viewGroupMembersValidator,
  removeGroupMembersValidator,
} from "../validators/group.validators.js";

const router = Router();

// Public / Authenticated routes

// View all groups user has joined
router.get("/", verifyJWT, viewAllJoinedGroup);

// Join group via invite code
router.post("/join", verifyJWT, joinGroupValidator(), validate, joinGroup);

// Mentor Only

// Create group
router.post(
  "/",
  verifyJWT,
  authorizeRoles("mentor"),
  createGroupValidator(),
  validate,
  createGroup,
);

// Update group
router.put(
  "/:groupId",
  verifyJWT,
  authorizeRoles("mentor"),
  updateGroupValidator(),
  validate,
  updateGroup,
);

// Invite members (generate invite code)
router.post(
  "/:groupId/invite",
  verifyJWT,
  authorizeRoles("mentor"),
  inviteMembersValidator(),
  validate,
  inviteMembers,
);

// Remove group member
router.delete(
  "/:groupId/members/:userId",
  verifyJWT,
  authorizeRoles("mentor"),
  removeGroupMembersValidator(),
  validate,
  removeGroupMembers,
);

// Any Group Member

// View group details
router.get(
  "/:groupId",
  verifyJWT,
  getGroupDetailsValidator(),
  validate,
  getGroupDetails,
);

// View group members
router.get(
  "/:groupId/members",
  verifyJWT,
  viewGroupMembersValidator(),
  validate,
  viewGroupMembers,
);

// Admin Only

// Delete group
router.delete(
  "/:groupId",
  verifyJWT,
  authorizeRoles("admin"),
  deleteGroupValidator(),
  validate,
  deleteGroup,
);

export default router;
