import mongoose, { Document, Types } from "mongoose";

export interface IChat extends Document {
  user: Types.ObjectId;
  title: string;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new mongoose.Schema<IChat>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "New Chat",
    },

    totalTokens: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", chatSchema);