
import { Request, Response, NextFunction } from "express";
import tokenService from "../service/token.service";
import { AppError } from "../service/asyncHandler";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    fullName?: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Access token required", 401);
    }

    const decoded = tokenService.verifyAccessToken(token);

    req.user = {
      _id: decoded._id,
      email: decoded.email,
      fullName: decoded.fullName,
    };

    next();
  } catch (error) {
    next(error);
  }
};