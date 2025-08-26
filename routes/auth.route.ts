import express, { Router } from "express";
import { signIn, signUp, refreshToken, changePassword } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router: Router = express.Router();

router.post("/signup", signUp);
router.post("/login", signIn);
router.post("/refresh-token", refreshToken);
router.put("/change-password", authMiddleware, changePassword);

export default router;
