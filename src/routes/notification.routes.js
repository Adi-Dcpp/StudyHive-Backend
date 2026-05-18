import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/", verifyJwt, getNotifications);
router.patch("/:id/read", verifyJwt, markAsRead);
router.patch("/mark-all-read", verifyJwt, markAllAsRead);
router.delete("/:id", verifyJwt, deleteNotification);

export default router;