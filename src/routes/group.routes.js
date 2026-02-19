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

import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middlewares.js";
import validate from "../middlewares/validators.middlewares.js";

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
router.get("/", verifyJwt, viewAllJoinedGroup);

// Join group via invite code
router.post("/join", verifyJwt, joinGroupValidator(), validate, joinGroup);

// Mentor Only

// Create group
router.post(
  "/",
  verifyJwt,
  authorizeRoles("mentor"),
  createGroupValidator(),
  validate,
  createGroup,
);

// Update group
router.put(
  "/:groupId",
  verifyJwt,
  authorizeRoles("mentor"),
  updateGroupValidator(),
  validate,
  updateGroup,
);

// Invite members (generate invite code)
router.post(
  "/:groupId/invite",
  verifyJwt,
  authorizeRoles("mentor"),
  inviteMembersValidator(),
  validate,
  inviteMembers,
);

// Remove group member
router.delete(
  "/:groupId/members/:userId",
  verifyJwt,
  authorizeRoles("mentor"),
  removeGroupMembersValidator(),
  validate,
  removeGroupMembers,
);

// Any Group Member

// View group details
router.get(
  "/:groupId",
  verifyJwt,
  getGroupDetailsValidator(),
  validate,
  getGroupDetails,
);

// View group members
router.get(
  "/:groupId/members",
  verifyJwt,
  viewGroupMembersValidator(),
  validate,
  viewGroupMembers,
);

// Delete group
router.delete(
  "/:groupId",
  verifyJwt,
  authorizeRoles("mentor"),
  deleteGroupValidator(),
  validate,
  deleteGroup,
);

export default router;
