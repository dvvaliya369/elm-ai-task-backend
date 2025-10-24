import express, { Router } from "express";
import passport from 'passport';
import { signIn, signUp, refreshToken, changePassword, githubAuthSuccess, githubAuthFailure } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router: Router = express.Router();

// Traditional auth routes
router.post("/signup", signUp);
router.post("/login", signIn);
router.post("/refresh-token", refreshToken);
router.put("/change-password", authMiddleware, changePassword);

// GitHub OAuth routes
router.get("/github", 
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get("/github/callback",
  passport.authenticate("github", { 
    failureRedirect: "/api/auth/github/failure" 
  }),
  githubAuthSuccess
);

router.get("/github/failure", githubAuthFailure);

export default router;
