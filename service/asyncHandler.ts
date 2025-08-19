import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

type AsyncRouteHandler<T extends Request = Request, U extends Response = Response> = (
  req: T,
  res: U,
  next: NextFunction
) => Promise<any>;

const asyncHandler = <T extends Request = Request, U extends Response = Response>(fn: AsyncRouteHandler<T, U>) => {
  return async (req: T, res: U, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (error: any) {
      console.error('Error in async handler:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString(),
      });

      let statusCode = 500;
      let message = 'Internal Server Error';

      if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
      } else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(error.errors).map((err: any) => err.message).join(', ');
      } else if (error.code === 11000) {
        statusCode = 409;
        const field = Object.keys(error.keyValue)[0];
        message = `${field} already exists`;
      } else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
      } else if (error.message) {
        message = error.message;
      }

      return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  };
};

export default asyncHandler;
