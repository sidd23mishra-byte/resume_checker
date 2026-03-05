import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { sendMessageToAI, getChatHistory, createNewChat } from "../controllers/chat.controller";

const router = express.Router();

// Send message (create new chat if needed)
router.post("/send",authMiddleware, sendMessageToAI);

// Fetch all user chats with messages
router.get("/history", authMiddleware, getChatHistory);

router.post("/new", authMiddleware, createNewChat);

export default router;