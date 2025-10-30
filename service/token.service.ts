import jwt, { SignOptions } from "jsonwebtoken";
import envConfig from "../config/env.config";

export interface TokenPayload {
  _id: string;
  email: string;
  fullName?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PasswordResetPayload {
  _id: string;
  email: string;
}

export interface EmailVerificationPayload {
  _id: string;
  email: string;
}

class TokenService {
  generateAccessToken(payload: TokenPayload): string {
    const secret = envConfig.JWT_SECRET_AUTH;
    if (!secret) {
      throw new Error("JWT_SECRET_AUTH is not defined");
    }

    const options: SignOptions = {
      expiresIn: 1 * 24 * 60 * 60,
    };

    return jwt.sign(payload, secret, options);
  }

  generateRefreshToken(payload: TokenPayload): string {
    const secret = envConfig.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }

    const options: SignOptions = {
      expiresIn: 30 * 24 * 60 * 60,
    };

    return jwt.sign(payload, secret, options);
  }

  generateTokenPair(payload: TokenPayload): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    const secret = envConfig.JWT_SECRET_AUTH;
    if (!secret) {
      throw new Error("JWT_SECRET_AUTH is not defined");
    }

    try {
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error: any) {
      throw new Error("Invalid or expired access token");
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    const secret = envConfig.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET is not defined");
    }

    try {
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error: any) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  generatePasswordResetToken(payload: PasswordResetPayload): string {
    const secret = envConfig.JWT_SECRET_AUTH;
    if (!secret) {
      throw new Error("JWT_SECRET_AUTH is not defined");
    }

    const options: SignOptions = {
      expiresIn: 60 * 60, // 1 hour
    };

    return jwt.sign(payload, secret, options);
  }

  verifyPasswordResetToken(token: string): PasswordResetPayload {
    const secret = envConfig.JWT_SECRET_AUTH;
    if (!secret) {
      throw new Error("JWT_SECRET_AUTH is not defined");
    }

    try {
      return jwt.verify(token, secret) as PasswordResetPayload;
    } catch (error: any) {
      throw new Error("Invalid or expired password reset token");
    }
  }

  generateEmailVerificationToken(payload: EmailVerificationPayload): string {
    const secret = envConfig.JWT_SECRET_AUTH;
    if (!secret) {
      throw new Error("JWT_SECRET_AUTH is not defined");
    }

    const options: SignOptions = {
      expiresIn: 24 * 60 * 60, // 24 hours
    };

    return jwt.sign(payload, secret, options);
  }

  verifyEmailVerificationToken(token: string): EmailVerificationPayload {
    const secret = envConfig.JWT_SECRET_AUTH;
    if (!secret) {
      throw new Error("JWT_SECRET_AUTH is not defined");
    }

    try {
      return jwt.verify(token, secret) as EmailVerificationPayload;
    } catch (error: any) {
      throw new Error("Invalid or expired email verification token");
    }
  }
}

export default new TokenService();
