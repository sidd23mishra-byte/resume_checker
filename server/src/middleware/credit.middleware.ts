import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const checkCredits = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.plan === "free" && req.user.credits <= 0) {
    return res.status(403).json({
      message: "No credits left. Upgrade to Pro.",
    });
  }

  next();
};