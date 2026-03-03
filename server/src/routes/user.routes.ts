import express from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getProfile,
  googleLogin,
} from "../controllers/user.controller";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validators/user.validator";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/google", googleLogin);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getProfile);

export default router;