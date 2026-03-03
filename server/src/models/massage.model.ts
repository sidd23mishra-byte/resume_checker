// src/models/massage.model.ts
import mongoose, { Document, Types } from "mongoose";

export interface IMessage extends Document {
  chat: Types.ObjectId;
  user: Types.ObjectId; // ✅ add user
  role: "user" | "assistant" | "system";
  content: string;
  tokens: number;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokens: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", messageSchema);