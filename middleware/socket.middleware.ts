import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import envConfig from "../config/env.config";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, envConfig.JWT_SECRET_AUTH as string) as any;
    
    if (!decoded || !decoded.id) {
      return next(new Error('Invalid authentication token'));
    }

    socket.userId = decoded.id;
    socket.user = decoded;
    
    console.log(`Socket authenticated for user: ${decoded.id}`);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};

export const socketRateLimitMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  // Basic rate limiting - can be enhanced with Redis
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  if (!socket.data.rateLimitWindow) {
    socket.data.rateLimitWindow = now;
    socket.data.requestCount = 0;
  }

  if (now - socket.data.rateLimitWindow > windowMs) {
    socket.data.rateLimitWindow = now;
    socket.data.requestCount = 0;
  }

  socket.data.requestCount++;

  if (socket.data.requestCount > maxRequests) {
    return next(new Error('Rate limit exceeded'));
  }

  next();
};