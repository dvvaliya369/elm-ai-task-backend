import { Router } from "express";
import {
  sendEmail,
  requestPasswordReset,
  resetPassword,
  sendEmailVerification,
  verifyEmail,
  testEmailConfig,
} from "../controllers/email.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Test email configuration (protected route)
router.get("/test-config", authMiddleware, testEmailConfig);

// Send custom email (protected route)
router.post("/send", authMiddleware, sendEmail);

// Password reset routes (public)
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/confirm", resetPassword);

// Email verification routes (public)
router.post("/verification/send", sendEmailVerification);
router.post("/verification/verify", verifyEmail);

export default router;