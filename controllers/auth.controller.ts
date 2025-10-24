import { Response, Request } from "express";
import passport from 'passport';

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

export const signIn = asyncHandler<ISignInRequest, Response>(
  async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      throw new AppError(message.EMAIL_NOT_FOUND, 400);
    }

    const user: UserDocument | null = await User.findOne({ email });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
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
    };

    return res.status(200).json({
      success: true,
      message: message.SIGNIN_SUCCESS,
      data: {
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
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

// GitHub Authentication Success Handler
export const githubAuthSuccess = asyncHandler<Request, Response>(
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
      githubUsername: user.githubUsername,
      authProvider: user.authProvider,
    };

    // In a real application, you would redirect to frontend with tokens
    // For now, we'll return JSON response
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

// GitHub Authentication Failure Handler
export const githubAuthFailure = asyncHandler<Request, Response>(
  async (req, res) => {
    return res.status(401).json({
      success: false,
      message: "GitHub authentication failed",
    });
  }
);
