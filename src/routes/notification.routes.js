import { Router } from "express";
import {
  getNotifications,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notification.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/", verifyJwt, getNotifications);
router.delete("/clear-all", verifyJwt, clearAllNotifications);
router.delete("/:id", verifyJwt, deleteNotification);

export default router;