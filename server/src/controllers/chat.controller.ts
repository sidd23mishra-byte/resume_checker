import { Request, Response } from "express";
import Message from "../models/massage.model";
import User from "../models/user.model";
import axios from "axios";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export const sendMessageToAI = async (req: Request, res: Response) => {
  try {
    const { chatId, content } = req.body;
    const user = (req as any).user;

    if (user?.plan === "free" && user.credits <= 0) {
      return res.status(403).json({ message: "No credits left" });
    }

    // Save user message first
    await Message.create({ chat: chatId, role: "user", content });

    // Send to FastAPI AI
    const aiResponse = await axios.post("http://localhost:8000/chat", {
      message: content,
    });

    const reply = aiResponse.data.response;

    // Save AI response
    await Message.create({ chat: chatId, role: "assistant", content: reply });

    // Deduct credit for free plan
    if (user?.plan === "free") {
      user.credits -= 1;
      await user.save();
      if (user.credits <= 1) {
        await notificationService.notifyLowCredits(user.email, user.credits);
      }
    }

    return res.json({ reply, creditsLeft: user?.credits });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "AI failed" });
  }
};