import mongoose, { Document, Types } from "mongoose";

export interface IResume extends Document {
  user: Types.ObjectId;
  originalFileName: string;
  fileUrl: string;
  fileType: "pdf" | "docx";
  fileSize: number;

  parsedText: string;

  score: number;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];

  jobRole?: string;

  status: "processing" | "completed" | "failed";

  createdAt: Date;
  updatedAt: Date;
  analysis?: any; 
}

const resumeSchema = new mongoose.Schema<IResume>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    originalFileName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      enum: ["pdf", "docx"],
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    parsedText: {
      type: String,
    },

    score: {
      type: Number,
      default: 0,
    },

    suggestions: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    jobRole: {
      type: String,
    },
    analysis: { type: mongoose.Schema.Types.Mixed },

    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IResume>("Resume", resumeSchema);