import { Request, Response, NextFunction } from 'express';
import { isValidEmail } from '../utils/email.utils';

/**
 * Middleware to validate email addresses in request body
 */
export const validateEmailMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { to, cc, bcc } = req.body;

  // Validate 'to' field
  if (to) {
    const toEmails = Array.isArray(to) ? to : [to];
    const invalidToEmails = toEmails.filter((email: string) => !isValidEmail(email));
    
    if (invalidToEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email addresses in "to" field',
        invalidEmails: invalidToEmails
      });
    }
  }

  // Validate 'cc' field
  if (cc) {
    const ccEmails = Array.isArray(cc) ? cc : [cc];
    const invalidCcEmails = ccEmails.filter((email: string) => !isValidEmail(email));
    
    if (invalidCcEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email addresses in "cc" field',
        invalidEmails: invalidCcEmails
      });
    }
  }

  // Validate 'bcc' field
  if (bcc) {
    const bccEmails = Array.isArray(bcc) ? bcc : [bcc];
    const invalidBccEmails = bccEmails.filter((email: string) => !isValidEmail(email));
    
    if (invalidBccEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email addresses in "bcc" field',
        invalidEmails: invalidBccEmails
      });
    }
  }

  next();
};

/**
 * Rate limiting middleware for email sending
 */
const emailRateLimit = new Map<string, { count: number; resetTime: number }>();

export const emailRateLimitMiddleware = (
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = emailRateLimit.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      // Reset or initialize
      emailRateLimit.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many email requests. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    clientData.count++;
    emailRateLimit.set(clientId, clientData);
    next();
  };
};

/**
 * Middleware to check if email service is configured
 */
export const checkEmailServiceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    return res.status(500).json({
      success: false,
      message: 'Email service not configured',
      missingEnvironmentVariables: missingVars
    });
  }
  
  next();
};

/**
 * Middleware to validate bulk email request
 */
export const validateBulkEmailMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { recipients } = req.body;
  
  if (!recipients || !Array.isArray(recipients)) {
    return res.status(400).json({
      success: false,
      message: 'Recipients must be an array'
    });
  }
  
  if (recipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Recipients array cannot be empty'
    });
  }
  
  if (recipients.length > 100) { // Limit bulk emails to 100 recipients
    return res.status(400).json({
      success: false,
      message: 'Too many recipients. Maximum 100 recipients allowed per bulk email'
    });
  }
  
  const invalidEmails = recipients.filter((email: string) => !isValidEmail(email));
  
  if (invalidEmails.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email addresses found',
      invalidEmails
    });
  }
  
  next();
};
