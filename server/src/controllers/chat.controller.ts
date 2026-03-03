import { Request, Response } from "express";
import Message from "../models/massage.model";
import Chat from "../models/chat.model";
import axios from "axios";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export const sendMessageToAI = async (req: any, res: Response) => {
  try {
    const { chatId, content } = req.body;
    const user = req.user; // authMiddleware must set this

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!content || !content.trim())
      return res.status(400).json({ message: "Message cannot be empty" });

    // 1️⃣ Handle credits
    if (user.plan === "free" && user.credits <= 0) {
      return res.status(403).json({ message: "No credits left" });
    }

    // 2️⃣ Find existing chat OR create new one
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: user._id });
      if (!chat) return res.status(403).json({ message: "Chat not found or unauthorized" });
    } else {
      chat = new Chat({
        user: user._id,
        title: content.substring(0, 30),
      });
      await chat.save();
    }

    // 3️⃣ Save user message
    const userMessage = new Message({
      chat: chat._id,
      user: user._id,
      role: "user",
      content,
    });
    await userMessage.save();

    // 4️⃣ Send to FastAPI AI
    const aiResponse = await axios.post("http://localhost:8000/chat", {
      message: content,
    });

    const reply = aiResponse.data.response;
    const tokensUsed = aiResponse.data.tokens || 0;

    // 5️⃣ Save AI message
    const aiMessage = new Message({
      chat: chat._id,
      user: user._id,
      role: "assistant",
      content: reply,
      tokens: tokensUsed,
    });
    await aiMessage.save();

    // 6️⃣ Update chat stats
    chat.totalTokens += tokensUsed;
    chat.updatedAt = new Date();
    await chat.save();

    // 7️⃣ Deduct credit for free plan
    if (user.plan === "free") {
      user.credits -= 1;
      await user.save();

      if (user.credits <= 1) {
        await notificationService.notifyLowCredits(user.email, user.credits);
      }
    }

    // 8️⃣ Return response
    return res.json({
      reply,
      chatId: chat._id,
      totalTokens: chat.totalTokens,
      creditsLeft: user.credits,
    });
  } catch (err: any) {
    console.error("sendMessageToAI error:", err.message);
    return res.status(500).json({ message: err.message || "AI failed" });
  }
};