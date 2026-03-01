import express from "express";
import { upload } from "../middleware/uplode.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadResume } from "../controllers/resume.controller";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

export default router;