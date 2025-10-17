import express, { Router } from "express";
import { signIn, signUp, refreshToken, changePassword, logout } from "../controllers/auth.controller.passport";
import { authenticateJWT } from "../middleware/passport.middleware";

const router: Router = express.Router();

router.post("/signup", signUp);
router.post("/login", signIn);
router.post("/refresh-token", refreshToken);
router.put("/change-password", authenticateJWT, changePassword);
router.post("/logout", authenticateJWT, logout);

export default router;
