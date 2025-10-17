import express, { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/passport.middleware";

const router: Router = express.Router();

// Example protected route using Passport.js authentication
router.get("/protected-example", requireAuth as any, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is a protected route! You are authenticated.",
    user: {
      id: (req.user as any)?._id,
      email: (req.user as any)?.email,
      fullName: (req.user as any)?.fullName
    }
  });
});

// Example public route
router.get("/public-example", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is a public route. No authentication required.",
    authenticated: req.isAuthenticated(),
    timestamp: new Date().toISOString()
  });
});

// Example route that shows different data based on auth status
router.get("/mixed-example", (req: Request, res: Response) => {
  const baseResponse = {
    success: true,
    message: "This route works for everyone but shows different data based on auth status",
    timestamp: new Date().toISOString()
  };

  if (req.isAuthenticated()) {
    res.status(200).json({
      ...baseResponse,
      authenticated: true,
      user: {
        id: (req.user as any)?._id,
        email: (req.user as any)?.email,
        fullName: (req.user as any)?.fullName
      },
      data: "This is secret data only available to authenticated users"
    });
  } else {
    res.status(200).json({
      ...baseResponse,
      authenticated: false,
      data: "This is public data available to everyone"
    });
  }
});

export default router;
