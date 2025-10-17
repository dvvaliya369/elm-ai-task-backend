import 'express';
import { UserDocument } from '../models/userSchema/type.userSchema';

declare global {
  namespace Express {
    interface User extends UserDocument {}
  }
}

declare module 'express-session' {
  interface SessionData {
    passport?: {
      user?: string;
    };
  }
}
