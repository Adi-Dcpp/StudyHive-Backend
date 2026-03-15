import { Router } from "express";
import { getMentorDashboard } from "../controllers/dashboard.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.middlewares.js";

const router = Router();

router.get("/mentor",
            verifyJwt,
            authorizeRoles("mentor"),
            getMentorDashboard
        );

export default router;
