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
      id: user._id,
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
