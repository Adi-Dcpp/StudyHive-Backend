import { Router } from "express";
import {
  sendMessage,
  getGroupMessages,
  deleteMessage,
} from "../controllers/message.controllers.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJwt);

router.post("/:groupId", sendMessage);

router.get("/:groupId", getGroupMessages);

router.delete("/:messageId", deleteMessage);

export default router;