import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middlewares.js";

import { verifyAdmin } from "../middlewares/admin.middlewares.js";

import {
  listUsers,
  getUserById,
  updateUserRole,
  suspendUser,
  unsuspendUser,
  deleteUser,
  listGroups,
  forceDeleteGroup,
  getPlatformStats,
} from "../controllers/admin.controllers.js";

const router = Router();

router.use(verifyJwt, verifyAdmin);

router.get("/users", listUsers);

router.get("/users/:userId", getUserById);

router.patch(
  "/users/:userId/role",
  updateUserRole,
);

router.patch(
  "/users/:userId/suspend",
  suspendUser,
);

router.patch(
  "/users/:userId/unsuspend",
  unsuspendUser,
);

router.delete(
  "/users/:userId",
  deleteUser,
);

router.get("/groups", listGroups);

router.delete(
  "/groups/:groupId",
  forceDeleteGroup,
);

router.get("/stats", getPlatformStats);

export default router;