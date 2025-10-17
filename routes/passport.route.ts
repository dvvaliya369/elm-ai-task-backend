import express, { Router, Request, Response } from "express";
import passport from "../config/passport.config";
import { requireAuth, requireNoAuth } from "../middleware/passport.middleware";
import User from "../models/userSchema/user.schema";
import { UserDocument } from "../models/userSchema/type.userSchema";

const router: Router = express.Router();

// Login route using Passport.js local strategy
router.post("/passport-login", requireNoAuth as any, (req: Request, res: Response, next) => {
  passport.authenticate('local', (err: any, user: UserDocument, info: any) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: err.message
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || 'Authentication failed'
      });
    }

    // Log the user in (create session)
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Login error',
          error: err.message
        });
      }

      // Remove sensitive information
      const { password, refreshToken, ...userInfo } = user.toObject();

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userInfo
      });
    });
  })(req, res, next);
});

// Register route (using existing signup logic but with Passport session)
router.post("/passport-register", requireNoAuth as any, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password
    });

    const savedUser = await newUser.save();

    // Auto-login after registration
    req.logIn(savedUser, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Registration successful but login failed',
          error: err.message
        });
      }

      // Remove sensitive information
      const { password, refreshToken, ...userInfo } = savedUser.toObject();

      return res.status(201).json({
        success: true,
        message: 'Registration and login successful',
        user: userInfo
      });
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Logout route
router.post("/passport-logout", requireAuth as any, (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: err.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// Get current user info
router.get("/passport-me", requireAuth as any, (req: Request, res: Response) => {
  if (req.user) {
    // Remove sensitive information
    const { password, refreshToken, ...userInfo } = (req.user as any).toObject();
    
    res.status(200).json({
      success: true,
      user: userInfo
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// Check authentication status
router.get("/passport-status", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: (req.user as any)?._id,
      email: (req.user as any)?.email,
      fullName: (req.user as any)?.fullName
    } : null
  });
});

export default router;
