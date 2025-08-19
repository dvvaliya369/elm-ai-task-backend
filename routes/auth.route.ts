import express, { Router } from "express";
import { signIn, signUp, refreshToken } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/refresh-token", refreshToken);

export default router;
