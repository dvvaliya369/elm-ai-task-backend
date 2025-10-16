import { Response } from "express";
import mongoose from "mongoose";
import User from "../models/userSchema/user.schema";
import Post from "../models/postSchema/post.schema";
import {
  SavePostToProfileRequest,
  RemovePostFromProfileRequest,
  GetSavedPostsRequest,
  UpdateProfileRequest,
  GetProfileRequest,
} from "./interface";
import asyncHandler, { AppError } from "../service/asyncHandler";
import cacheService from "../service/cache.service";
import { uploadToCloud, generateUniqueFileName } from "../utils/fileUpload";

export const getProfile = asyncHandler(
  async (req: GetProfileRequest, res: Response) => {
    const { id } = req.params || {};
    const currentUser = req.user;

    const userId = id || currentUser?._id;

    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    const cacheKey = cacheService.generateProfileKey(userId);

    const cachedProfile = await cacheService.get(cacheKey);
    if (cachedProfile) {
      return res.status(200).json({
        success: true,
        message: "Profile fetched successfully (cached)",
        data: cachedProfile,
      });
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    await cacheService.set(cacheKey, user, 3600);

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
      const photoUrl = await uploadToCloud(file, "profiles");
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

    const cacheKey = cacheService.generateProfileKey(user._id);
    await cacheService.delete(cacheKey);

    const updatedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    await cacheService.set(cacheKey, updatedUser, 3600);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  }
);

// Save post to user's profile
export const savePostToProfile = asyncHandler<
  SavePostToProfileRequest,
  Response
>(async (req, res) => {
  const { postId } = req.params;
  const user = req.user;

  if (!user) {
    throw new AppError("User not authenticated", 401);
  }

  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  // Check if post is already saved
  const currentUser = await User.findById(user._id);
  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  if (currentUser.savedPosts?.includes(new mongoose.Types.ObjectId(postId))) {
    throw new AppError("Post already saved to profile", 400);
  }

  // Add post to saved posts
  await User.findByIdAndUpdate(
    user._id,
    { $addToSet: { savedPosts: postId } },
    { new: true }
  );

  // Clear profile cache
  const cacheKey = cacheService.generateProfileKey(user._id);
  await cacheService.delete(cacheKey);

  return res.status(201).json({
    success: true,
    message: "Post saved to profile successfully",
    data: {
      postId: postId,
      userId: user._id,
      savedAt: new Date(),
    },
  });
});

// Remove post from user's profile
export const removePostFromProfile = asyncHandler<
  RemovePostFromProfileRequest,
  Response
>(async (req, res) => {
  const { postId } = req.params;
  const user = req.user;

  if (!user) {
    throw new AppError("User not authenticated", 401);
  }

  // Check if post exists in user's saved posts
  const currentUser = await User.findById(user._id);
  if (!currentUser) {
    throw new AppError("User not found", 404);
  }

  if (!currentUser.savedPosts?.includes(new mongoose.Types.ObjectId(postId))) {
    throw new AppError("Post not found in saved posts", 404);
  }

  // Remove post from saved posts
  await User.findByIdAndUpdate(
    user._id,
    { $pull: { savedPosts: postId } },
    { new: true }
  );

  // Clear profile cache
  const cacheKey = cacheService.generateProfileKey(user._id);
  await cacheService.delete(cacheKey);

  return res.status(200).json({
    success: true,
    message: "Post removed from profile successfully",
    data: {
      postId: postId,
      userId: user._id,
    },
  });
});

// Get user's saved posts
export const getSavedPosts = asyncHandler<GetSavedPostsRequest, Response>(
  async (req, res) => {
    const { page = "1", limit = "10", sortBy = "newest" } = req.query;
    const user = req.user;

    if (!user) {
      throw new AppError("User not authenticated", 401);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let sortObj: Record<string, number> = {};
    switch (sortBy) {
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const currentUser = await User.findById(user._id).populate({
      path: "savedPosts",
      match: { isDeleted: { $ne: true } },
      populate: {
        path: "user",
        select: "firstName lastName email profilePhoto",
      },
      options: {
        sort: sortObj,
        skip: skip,
        limit: limitNum,
      },
    });

    if (!currentUser) {
      throw new AppError("User not found", 404);
    }

    const savedPosts = currentUser.savedPosts || [];

    // Get total count of saved posts (not deleted)
    const totalSavedPosts = await Post.countDocuments({
      _id: { $in: currentUser.savedPosts },
      isDeleted: { $ne: true },
    });

    const totalPages = Math.ceil(totalSavedPosts / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const responseData = {
      savedPosts: (savedPosts as unknown[]).map(
        (post: Record<string, unknown>) => ({
          _id: post._id,
          user: {
            _id: (post.user as Record<string, unknown>)._id,
            fullName: `${(post.user as Record<string, unknown>).firstName} ${(post.user as Record<string, unknown>).lastName}`,
            firstName: (post.user as Record<string, unknown>).firstName,
            lastName: (post.user as Record<string, unknown>).lastName,
            email: (post.user as Record<string, unknown>).email,
            profilePhoto: (post.user as Record<string, unknown>).profilePhoto,
          },
          caption: post.caption,
          media: post.media,
          likesCount: (post.likes as unknown[])?.length || 0,
          commentsCount: (post.comments as unknown[])?.length || 0,
          isLikedByUser:
            (post.likes as Record<string, unknown>[])?.some(
              (like: Record<string, unknown>) =>
                like.user?.toString() === user._id.toString()
            ) || false,
          isCommentedByUser:
            (post.comments as Record<string, unknown>[])?.some(
              (comment: Record<string, unknown>) =>
                comment.user?.toString() === user._id.toString()
            ) || false,
          isSaved: true,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })
      ),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalSavedPosts,
        hasNextPage,
        hasPrevPage,
        limit: limitNum,
      },
      filters: {
        sortBy,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Saved posts fetched successfully",
      data: responseData,
    });
  }
);
