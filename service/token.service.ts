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
}

export default new TokenService();
