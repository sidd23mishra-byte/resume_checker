import { Request, Response } from "express";
import Chat from "../models/chat.model";
import Message from "../models/massage.model";
import axios from "axios";

// 1️⃣ Send message to AI (existing)
export const sendMessageToAI = async (req: any, res: Response) => {
  try {
    const { chatId, content } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!content || !content.trim())
      return res.status(400).json({ message: "Message cannot be empty" });

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: user._id });
      if (!chat) return res.status(403).json({ message: "Chat not found" });
    } else {
      chat = new Chat({ user: user._id, title: content.substring(0, 30) });
      await chat.save();
    }

    // Save user message
    const userMessage = new Message({
      chat: chat._id,
      user: user._id,
      role: "user",
      content,
    });
    await userMessage.save();

    // Call AI API
    const aiResponse = await axios.post("http://localhost:8000/chat", { message: content });
    const reply = aiResponse.data.response;
    const tokensUsed = aiResponse.data.tokens || 0;

    // Save AI message
    const aiMessage = new Message({
      chat: chat._id,
      user: user._id,
      role: "assistant",
      content: reply,
      tokens: tokensUsed,
    });
    await aiMessage.save();

    // Update chat stats
    chat.totalTokens += tokensUsed;
    chat.updatedAt = new Date();
    await chat.save();

    return res.json({
      reply,
      chatId: chat._id,
      totalTokens: chat.totalTokens,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "AI failed" });
  }
};

// 2️⃣ Get chat history (existing)
export const getChatHistory = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();

    const chatsWithMessages = await Promise.all(
      chats.map(async (chat) => {
        const messages = await Message.find({ chat: chat._id })
          .sort({ createdAt: 1 })
          .lean();
        return { ...chat, messages };
      })
    );

    res.json({ chats: chatsWithMessages });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to fetch history" });
  }
};

// 3️⃣ Create new chat (new endpoint for your Dashboard)
export const createNewChat = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const newChat = new Chat({ user: user._id, title: "New Chat" });
    await newChat.save();

    res.json({ chat: newChat });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to create chat" });
  }
};