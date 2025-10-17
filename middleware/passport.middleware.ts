import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport.config';
import { AppError } from '../service/asyncHandler';

// Middleware to authenticate using local strategy
export const authenticateLocal = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return next(new AppError(info?.message || 'Authentication failed', 401));
    }
    
    // Attach user to request object
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware to authenticate using JWT strategy
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    
    if (!user) {
      return next(new AppError('Authentication required', 401));
    }
    
    // Attach user to request object
    req.user = user;
    next();
  })(req, res, next);
};

// Middleware to authenticate using Google OAuth strategy
export const authenticateGoogle = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: true
  })(req, res, next);
};

// Middleware to handle Google OAuth callback
export const authenticateGoogleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { 
    failureRedirect: '/auth/google/failure',
    session: true
  })(req, res, next);
};

// Initialize passport middleware
export const initializePassport = () => {
  return passport.initialize();
};

// Session middleware for passport (if using sessions)
export const passportSession = () => {
  return passport.session();
};
