import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport.config';
import { AppError } from '../service/asyncHandler';

// Middleware to authenticate using local strategy (for login)
export const passportLocalAuth = (req: Request, res: Response, next: NextFunction) => {
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

// Middleware to authenticate using JWT strategy (for protected routes)
export const passportJWTAuth = (req: Request, res: Response, next: NextFunction) => {
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

// Optional JWT authentication (doesn't fail if no token)
export const passportJWTOptional = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    
    // Attach user to request object if authenticated, otherwise continue
    if (user) {
      req.user = user;
    }
    next();
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
