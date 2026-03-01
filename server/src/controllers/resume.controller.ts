// src/controllers/resume.controller.ts
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { extractTextFromFile } from "../utils/extractText.js"; // use .js if TS/pdf-parse issues
import cloudinary from "../config/cloudinary";
import fs from "fs";
import axios from "axios";
import Resume from "../models/resume.model";

export const uploadResume = async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;
  const jobDescription = req.body.jobDescription;

  if (!jobDescription || !jobDescription.trim()) {
    return res.status(400).json({ message: "Job description is required" });
  }

  // variables lifted for use in catch block
  let resumeText: string | undefined;
  let cloudResult: any;
  let aiResponse: any;

  try {
    // 1️⃣ Extract text from PDF/DOCX
    resumeText = await extractTextFromFile(filePath, mimeType);

    if (!resumeText.trim()) {
      return res.status(400).json({ message: "Could not extract text from resume" });
    }

    // 2️⃣ Upload file to Cloudinary
    cloudResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "resumes",
    });

    // 3️⃣ Send extracted text + JD to FastAPI AI service
    aiResponse = await axios.post("http://localhost:8000/resume-match", {
      resume_text: resumeText,
      job_description: jobDescription,
    });

    // 4️⃣ Persist resume record in MongoDB
    const resumeDoc = new Resume({
      user: req.user?._id, // set by auth middleware
      originalFileName: req.file.originalname,
      fileUrl: cloudResult.secure_url,
      fileType: mimeType === "application/pdf" ? "pdf" : "docx",
      fileSize: req.file.size,
      parsedText: resumeText,
      score: aiResponse.data?.data?.matchPercentage || 0,
      suggestions: aiResponse.data?.data?.suggestions || [],
      strengths: aiResponse.data?.data?.matchedSkills || [],
      weaknesses: aiResponse.data?.data?.missingSkills || [],
      jobRole: jobDescription,
      analysis: aiResponse.data,
      status: "completed",
    });

    await resumeDoc.save();

    // 5️⃣ Return Cloudinary URL + AI result
    res.json({
      success: true,
      cloudUrl: cloudResult.secure_url,
      aiAnalysis: aiResponse.data,
      resumeId: resumeDoc._id,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // attempt to save a failed record if we have partial info
    try {
      const failedDoc = new Resume({
        user: req.user?._id,
        originalFileName: req.file?.originalname || "",
        fileUrl: cloudResult?.secure_url || "",
        fileType: mimeType === "application/pdf" ? "pdf" : "docx",
        fileSize: req.file?.size || 0,
        parsedText: resumeText || "",
        status: "failed",
        analysis: { error: message },
      });
      await failedDoc.save();
    } catch (saveErr) {
      console.error("Failed to record failed resume:", saveErr);
    }

    res.status(500).json({ message: "Resume processing failed", error: message });

  } finally {
    // 5️⃣ Delete local file after processing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};