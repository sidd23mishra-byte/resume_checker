import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkCredits } from "../middleware/credit.middleware";
import { saveUserMessage } from "../middleware/saveMessage.middleware";
import { sendMessageToAI } from "../controllers/chat.controller";

const router = express.Router();

router.post(
  "/send",
  authMiddleware,
  checkCredits,
  saveUserMessage,
  sendMessageToAI
);

export default router;