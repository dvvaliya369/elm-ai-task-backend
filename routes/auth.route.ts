import express, { Router } from "express";
import { 
  signIn, 
  signUp, 
  refreshToken, 
  changePassword, 
  logout, 
  googleAuthSuccess, 
  googleAuthFailure,
  githubAuthSuccess,
  githubAuthFailure
} from "../controllers/auth.controller.passport";
import { 
  authenticateJWT, 
  authenticateGoogle, 
  authenticateGoogleCallback,
  authenticateGitHub,
  authenticateGitHubCallback
} from "../middleware/passport.middleware";

const router: Router = express.Router();

// Regular auth routes
router.post("/signup", signUp);
router.post("/login", signIn);
router.post("/refresh-token", refreshToken);
router.put("/change-password", authenticateJWT, changePassword);
router.post("/logout", authenticateJWT, logout);

// Google OAuth routes
router.get("/google", authenticateGoogle);
router.get("/google/callback", authenticateGoogleCallback, googleAuthSuccess);
router.get("/google/failure", googleAuthFailure);

// GitHub OAuth routes
router.get("/github", authenticateGitHub);
router.get("/github/callback", authenticateGitHubCallback, githubAuthSuccess);
router.get("/github/failure", githubAuthFailure);

export default router;
