import express, { Router } from "express";
import {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  verifyEmailService,
} from "../controllers/email.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router: Router = express.Router();

// Protected routes - require authentication
router.post("/send", authMiddleware, sendEmail);

// Public routes - can be called by system/admin
router.post("/welcome", sendWelcomeEmail);
router.post("/password-reset", sendPasswordResetEmail);
router.get("/verify", verifyEmailService);

export default router;
