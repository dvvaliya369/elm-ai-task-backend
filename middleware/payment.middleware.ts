import { Request, Response, NextFunction } from 'express';

// Middleware to validate Razorpay webhook requests
export const validateWebhookMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Store raw body for webhook signature verification
  req.body = req.body;
  next();
};

// Middleware to validate payment amounts
export const validateAmountMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid amount. Amount must be a positive number.',
    });
  }

  // Check for maximum amount limit (optional)
  const maxAmount = 1000000; // 10,00,000 paise = ₹10,000
  if (amount > maxAmount) {
    return res.status(400).json({
      success: false,
      message: `Amount cannot exceed ₹${maxAmount / 100}`,
    });
  }

  next();
};

// Middleware to validate currency
export const validateCurrencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { currency } = req.body;

  if (currency && !['INR', 'USD'].includes(currency)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid currency. Only INR and USD are supported.',
    });
  }

  next();
};

// Rate limiting middleware for payment requests
export const paymentRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Implement rate limiting logic here
  // This is a simple example - use a proper rate limiting library like express-rate-limit in production
  
  const userId = (req as any).user?.id;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // Maximum 10 payment requests per minute

  // Store request timestamps in memory (use Redis in production)
  const userRequests = global.paymentRequests || {};
  global.paymentRequests = userRequests;

  if (!userRequests[userId]) {
    userRequests[userId] = [];
  }

  // Remove old requests outside the window
  userRequests[userId] = userRequests[userId].filter((timestamp: number) => now - timestamp < windowMs);

  if (userRequests[userId].length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many payment requests. Please try again later.',
    });
  }

  // Add current request
  userRequests[userId].push(now);
  next();
};
