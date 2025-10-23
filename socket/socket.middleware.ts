import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import envConfig from '../config/env.config';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const authenticateSocket = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    if (!envConfig.JWT_SECRET_AUTH) {
      return next(new Error('JWT secret not configured'));
    }

    const decoded = jwt.verify(token, envConfig.JWT_SECRET_AUTH) as any;
    socket.userId = decoded.id || decoded.userId;
    socket.user = decoded;
    
    console.log(`Socket authenticated for user: ${socket.userId}`);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Invalid authentication token'));
  }
};

export const validateSocketData = (data: any, requiredFields: string[]) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return true;
};