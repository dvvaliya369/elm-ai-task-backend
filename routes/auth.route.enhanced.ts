import express, { Router } from "express";
import { signIn, signUp, refreshToken, changePassword, logout } from "../controllers/auth.controller.enhanced";
import { passportJWTAuth } from "../middleware/passport.enhanced";

const router: Router = express.Router();

// User registration (unchanged)
router.post("/signup", signUp);

// User login (now enhanced with Passport.js)
router.post("/login", signIn);

// Token refresh (unchanged)
router.post("/refresh-token", refreshToken);

// Change password (now uses Passport JWT middleware)
router.put("/change-password", passportJWTAuth, changePassword);

// Logout (new - enhanced with Passport.js)
router.post("/logout", passportJWTAuth, logout);

export default router;
