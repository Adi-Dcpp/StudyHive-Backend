import { Router } from "express";

import {
  createGoal,
  getGoalsByGroup,
  getMyGoals,
  updateGoal,
  deleteGoal,
} from "../controllers/goals.controllers.js";

import {
  createGoalValidator,
  updateGoalValidator,
  groupIdParamValidator,
} from "../validators/goals.validators.js";

import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Learner routes
router.get(
  "/me",
  verifyJWT,
  authorizeRoles("learner"),
  getMyGoals
);

//Mentor routes
router.post(
  "/:groupId",
  verifyJWT,
  authorizeRoles("mentor"),
  groupIdParamValidator(),
  createGoalValidator(),
  validate,
  createGoal
);

router.get(
  "/:groupId",
  verifyJWT,
  authorizeRoles("mentor"),
  groupIdParamValidator(),
  validate,
  getGoalsByGroup
);

router.put(
  "/:goalId",
  verifyJWT,
  authorizeRoles("mentor"),
  updateGoalValidator(),
  validate,
  updateGoal
);

router.delete(
  "/:goalId",
  verifyJWT,
  authorizeRoles("mentor"),
  updateGoalValidator(),
  validate,
  deleteGoal
);

export default router;
