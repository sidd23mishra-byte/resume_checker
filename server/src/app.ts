import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import resumeRoutes from "./routes/resume.routes";
import cookieParser from "cookie-parser";


// Load environment variables
dotenv.config();

const app: Application = express();

// --------------------
// Middleware
// --------------------
app.use(
  cors({
    origin: "http://localhost:3000", //Eneter your frontend URL here
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Routes
// --------------------
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/resume", resumeRoutes);

// --------------------
// 404 Handler
// --------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// --------------------
// Global Error Handler
// --------------------
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// --------------------
// MongoDB Connection
// --------------------
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai_resume";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;