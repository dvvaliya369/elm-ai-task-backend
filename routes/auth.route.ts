import express, { Router } from "express";
import { signIn, signUp, refreshToken, changePassword, githubCallback } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import passport from "../config/passport.config";

const router: Router = express.Router();

router.post("/signup", signUp);
router.post("/login", signIn);
router.post("/refresh-token", refreshToken);
router.put("/change-password", authMiddleware, changePassword);

// GitHub OAuth routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false
  }),
  githubCallback
);

export default router;
