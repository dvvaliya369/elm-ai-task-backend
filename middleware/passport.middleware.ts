import { Request, Response, NextFunction } from 'express';
import { UserDocument } from '../models/userSchema/type.userSchema';

// Passport.js specific request interface
interface PassportRequest extends Request {
  user?: UserDocument;
}

// Middleware to check if user is authenticated via Passport.js sessions
export const requireAuth = (req: PassportRequest, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({
    success: false,
    message: 'Authentication required. Please log in.'
  });
};

// Middleware to check if user is NOT authenticated (for login/register pages)
export const requireNoAuth = (req: PassportRequest, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  
  res.status(400).json({
    success: false,
    message: 'Already authenticated. Please log out first.'
  });
};

// Optional middleware - continue regardless of auth status
export const optionalAuth = (req: PassportRequest, res: Response, next: NextFunction) => {
  // This middleware doesn't block the request, just provides user info if available
  next();
};
