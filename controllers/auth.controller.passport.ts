import { Response } from "express";
import {
  UserDocument,
  UserInterface,
} from "../models/userSchema/type.userSchema";
import User from "../models/userSchema/user.schema";
import asyncHandler, { AppError } from "../service/asyncHandler";
import { message } from "../utils/constant";
import {
  ISignUpRequest,
  ISignInRequest,
  IRefreshTokenRequest,
  IChangePasswordRequest,
} from "./interface";
import tokenService, { TokenPayload } from "../service/token.service";
import { authenticateLocal } from "../middleware/passport.middleware";
import envConfig from "../config/env.config";

export const signUp = asyncHandler<ISignUpRequest, Response>(
  async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email) {
      throw new AppError(message.EMAIL_NOT_FOUND, 400);
    }

    const isExistUser = await User.findOne({ email });
    if (isExistUser) {
      throw new AppError(message.ALREADY_SIGNUP, 409);
    }

    const newUserData: UserInterface = {
      email,
      firstName,
      lastName,
      password,
    };

    await User.create(newUserData);
    res.status(201).json({
      success: true,
      message: message.SIGNUP_SUCCESS,
    });
  }
);

// Updated signIn to use Passport.js local strategy
export const signIn = asyncHandler<ISignInRequest, Response>(
  async (req, res, next) => {
    // Use Passport.js local authentication
    authenticateLocal(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      const user = req.user as UserDocument;

      const tokenPayload: TokenPayload = {
        _id: user._id?.toString(),
        email: user.email,
        fullName: user.fullName,
      };

      const tokens = tokenService.generateTokenPair(tokenPayload);

      user.refreshToken = tokens.refreshToken;
      await user.save();

      const userData = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePhoto: user.profilePhoto,
      };

      // Login user in session (if using sessions)
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.warn('Session login failed:', loginErr);
          // Continue without session login
        }
      });

      return res.status(200).json({
        success: true,
        message: message.SIGNIN_SUCCESS,
        data: {
          user: userData,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    });
  }
);

// Refresh Token endpoint
export const refreshToken = asyncHandler<IRefreshTokenRequest, Response>(
  async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    const decoded = tokenService.verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    const tokenPayload: TokenPayload = {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
    };

    const tokens = tokenService.generateTokenPair(tokenPayload);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }
);

export const changePassword = asyncHandler<IChangePasswordRequest, Response>(
  async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    if (!user) {
      throw new AppError("User not authenticated", 401);
    }

    if (!oldPassword || !newPassword) {
      throw new AppError("Old password and new password are required", 400);
    }

    if (newPassword.length < 4) {
      throw new AppError("New password must be at least 4 characters long", 400);
    }

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      throw new AppError("User not found", 404);
    }

    const isOldPasswordValid = await userDoc.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    userDoc.password = newPassword;
    await userDoc.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  }
);

// Google OAuth Success Handler
export const googleAuthSuccess = asyncHandler<any, Response>(
  async (req, res) => {
    const user = req.user as UserDocument;

    if (!user) {
      throw new AppError("Authentication failed", 401);
    }

    const tokenPayload: TokenPayload = {
      _id: user._id?.toString(),
      email: user.email,
      fullName: user.fullName,
    };

    const tokens = tokenService.generateTokenPair(tokenPayload);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePhoto: user.profilePhoto,
      provider: user.provider,
    };

    // Login user in session
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.warn('Session login failed:', loginErr);
      }
    });

    // In production, you might want to redirect to your frontend with tokens
    // For now, returning JSON response
    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
      data: {
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }
);

// Google OAuth Failure Handler
export const googleAuthFailure = asyncHandler<any, Response>(
  async (req, res) => {
    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
);

// GitHub OAuth Success Handler
export const githubAuthSuccess = asyncHandler<any, Response>(
  async (req, res) => {
    const user = req.user as UserDocument;

    if (!user) {
      throw new AppError("Authentication failed", 401);
    }

    const tokenPayload: TokenPayload = {
      _id: user._id?.toString(),
      email: user.email,
      fullName: user.fullName,
    };

    const tokens = tokenService.generateTokenPair(tokenPayload);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePhoto: user.profilePhoto,
      provider: user.provider,
    };

    // Login user in session
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.warn('Session login failed:', loginErr);
      }
    });

    // In production, you might want to redirect to your frontend with tokens
    // For now, returning JSON response
    return res.status(200).json({
      success: true,
      message: "GitHub authentication successful",
      data: {
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }
);

// GitHub OAuth Failure Handler
export const githubAuthFailure = asyncHandler<any, Response>(
  async (req, res) => {
    return res.status(401).json({
      success: false,
      message: "GitHub authentication failed",
    });
  }
);

// Facebook OAuth Success Handler
export const facebookAuthSuccess = asyncHandler<any, Response>(
  async (req, res) => {
    const user = req.user as UserDocument;

    if (!user) {
      throw new AppError("Authentication failed", 401);
    }

    const tokenPayload: TokenPayload = {
      _id: user._id?.toString(),
      email: user.email,
      fullName: user.fullName,
    };

    const tokens = tokenService.generateTokenPair(tokenPayload);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePhoto: user.profilePhoto,
      provider: user.provider,
    };

    // Login user in session
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.warn('Session login failed:', loginErr);
      }
    });

    // In production, you might want to redirect to your frontend with tokens
    // For now, returning JSON response
    return res.status(200).json({
      success: true,
      message: "Facebook authentication successful",
      data: {
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  }
);

// Facebook OAuth Failure Handler
export const facebookAuthFailure = asyncHandler<any, Response>(
  async (req, res) => {
    return res.status(401).json({
      success: false,
      message: "Facebook authentication failed",
    });
  }
);

// Passport.js logout endpoint
export const logout = asyncHandler<any, Response>(
  async (req, res) => {
    // Clear refresh token from database
    if (req.user) {
      const user = await User.findById((req.user as UserDocument)._id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    // Passport.js logout
    req.logout((err: any) => {
      if (err) {
        console.warn('Logout error:', err);
      }
    });

    // Destroy session
    req.session.destroy((err: any) => {
      if (err) {
        console.warn('Session destroy error:', err);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);
