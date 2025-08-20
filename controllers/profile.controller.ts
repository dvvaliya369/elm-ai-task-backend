import { Response } from "express";
import User from "../models/userSchema/user.schema";
import {
  uploadToCloud,
  generateUniqueFileName,
} from "../utils/fileUpload";
import { UpdateProfileRequest, GetProfileRequest } from "./interface";
import asyncHandler, { AppError } from "../service/asyncHandler";

export const getProfile = asyncHandler(
  async (req: GetProfileRequest, res: Response) => {
    const { id } = req.params || {};
    const currentUser = req.user;

    const userId = id || currentUser?._id;

    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  }
);

export const updateProfile = asyncHandler(
  async (req: UpdateProfileRequest, res: Response) => {
    const { firstName, lastName } = req.body;
    const file = req.file;
    const user = req.user;

    if (!user) {
      throw new AppError("User not authenticated", 401);
    }

    const existingUser = await User.findById(user._id);
    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    if (firstName) existingUser.firstName = firstName;
    if (lastName) existingUser.lastName = lastName;

    if (file) {
      const photoUrl = await uploadToCloud(file);
      const uniqueFileName = generateUniqueFileName(file.originalname);

      existingUser.profilePhoto = {
        photo_id: uniqueFileName,
        photo_url: photoUrl,
        photo_data: JSON.stringify({
          type: file.mimetype,
          size: file.size,
        }),
      };
    }

    await existingUser.save();

    const updatedUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  }
);
