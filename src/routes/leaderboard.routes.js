import { Router } from "express";

import { getMyProgress } from "../controllers/leaderboard.controllers.js";

import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/:groupId", verifyJwt, getMyProgress);

export default router;