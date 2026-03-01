import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import Message from "../models/massage.model";
import Chat from "../models/chat.model";

export const saveUserMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatId, content } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    await Message.create({
      chat: chatId,
      role: "user",
      content,
    });

    next();
  } catch (error) {
    return res.status(500).json({ message: "Message save failed" });
  }
};