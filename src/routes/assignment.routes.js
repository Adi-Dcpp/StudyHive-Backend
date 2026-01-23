import { Router } from "express";
import {
  createAssignment,
  getAssignmentsByGoal,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignment.controllers.js";

import {
  createAssignmentValidator,
  updateAssignmentValidator,
  deleteAssignmentValidator,
  getAssignmentsByGoalValidator,
} from "../validators/assignment.validators.js";

import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middlewares.js";
import validate from "../middlewares/validators.middlewares.js";

const router = Router();

router.post(
  "/goals/:goalId/assignments",
  verifyJwt,
  authorizeRoles("mentor"),
  createAssignmentValidator,
  validate,
  createAssignment
);

router.get(
  "/goals/:goalId/assignments",
  verifyJwt,
  getAssignmentsByGoalValidator,
  validate,
  getAssignmentsByGoal
);

router.put(
  "/assignments/:assignmentId",
  verifyJwt,
  authorizeRoles("mentor"),
  updateAssignmentValidator,
  validate,
  updateAssignment
);

router.delete(
  "/assignments/:assignmentId",
  verifyJwt,
  authorizeRoles("mentor"),
  deleteAssignmentValidator,
  validate,
  deleteAssignment
);

export default router;
