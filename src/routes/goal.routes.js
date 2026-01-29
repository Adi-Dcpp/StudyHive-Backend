import { Router } from "express";

import {
  createGoal,
  getGoalsByGroup,
  getMyGoals,
  updateGoal,
  deleteGoal,
} from "../controllers/goal.controllers.js";

import {
  createGoalValidator,
  updateGoalValidator,
  goalIdParamValidator,
  groupIdParamValidator,
} from "../validators/goal.validators.js";

import validate from "../middlewares/validators.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middlewares.js";

const router = Router();

// Learner routes
router.get(
  "/me",
  verifyJwt,
  authorizeRoles("learner"),
  getMyGoals
);

//Mentor routes
router.post(
  "/:groupId",
  verifyJwt,
  authorizeRoles("mentor"),
  groupIdParamValidator(),
  createGoalValidator(),
  validate,
  createGoal
);

router.get(
  "/:groupId",
  verifyJwt,
  authorizeRoles("mentor"),
  groupIdParamValidator(),
  validate,
  getGoalsByGroup
);

router.put(
  "/:goalId",
  verifyJwt,
  authorizeRoles("mentor"),
  updateGoalValidator(),
  validate,
  updateGoal
);

router.delete(
  "/:goalId",
  verifyJwt,
  authorizeRoles("mentor"),
  goalIdParamValidator(),
  validate,
  deleteGoal
);

export default router;
