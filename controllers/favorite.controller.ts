import { Response } from "express";
import mongoose from "mongoose";
import Favorite from "../models/favoriteSchema/favorite.schema";
import Post from "../models/postSchema/post.schema";
import {
  AddFavoriteRequest,
  RemoveFavoriteRequest,
  GetFavoritesRequest,
  CheckFavoriteRequest,
} from "./interface";
import asyncHandler, { AppError } from "../service/asyncHandler";
import cacheService from "../service/cache.service";

// Add post to favorites
export const addToFavorites = asyncHandler<AddFavoriteRequest, Response>(
  async (req, res) => {
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

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: user._id,
      post: postId,
    });

    if (existingFavorite) {
      throw new AppError("Post already added to favorites", 400);
    }

    // Add to favorites
    const favorite = await Favorite.create({
      user: user._id,
      post: postId,
    });

    // Clear user favorites cache
    const userFavoritesPattern = cacheService.generateUserFavoritesPattern(user._id);
    await cacheService.deletePattern(userFavoritesPattern);

    return res.status(201).json({
      success: true,
      message: "Post added to favorites successfully",
      data: {
        favoriteId: favorite._id,
        postId: postId,
        userId: user._id,
        createdAt: favorite.createdAt,
      },
    });
  }
);

// Remove post from favorites
export const removeFromFavorites = asyncHandler<RemoveFavoriteRequest, Response>(
  async (req, res) => {
    const { postId } = req.params;
    const user = req.user;

    if (!user) {
      throw new AppError("User not authenticated", 401);
    }

    // Find and remove favorite
    const favorite = await Favorite.findOneAndDelete({
      user: user._id,
      post: postId,
    });

    if (!favorite) {
      throw new AppError("Post not found in favorites", 404);
    }

    // Clear user favorites cache
    const userFavoritesPattern = cacheService.generateUserFavoritesPattern(user._id);
    await cacheService.deletePattern(userFavoritesPattern);

    return res.status(200).json({
      success: true,
      message: "Post removed from favorites successfully",
      data: {
        postId: postId,
        userId: user._id,
      },
    });
  }
);

// Get user's favorite posts
export const getFavorites = asyncHandler<GetFavoritesRequest, Response>(
  async (req, res) => {
    const { page = "1", limit = "10", sortBy = "newest" } = req.query;
    const user = req.user;

    if (!user) {
      throw new AppError("User not authenticated", 401);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Check cache first
    const cacheKey = cacheService.generateUserFavoritesKey(user._id, pageNum, limitNum, sortBy);
    const cachedFavorites = await cacheService.get(cacheKey);

    if (cachedFavorites) {
      return res.status(200).json({
        success: true,
        message: "Favorite posts fetched successfully (cached)",
        data: cachedFavorites,
      });
    }

    let sortObj: any = {};
    switch (sortBy) {
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const aggregationPipeline: any[] = [
      {
        $match: { user: new mongoose.Types.ObjectId(user._id) }
      },
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "postData",
        },
      },
      {
        $unwind: "$postData"
      },
      {
        $match: {
          "postData.isDeleted": { $ne: true }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "postData.user",
          foreignField: "_id",
          as: "postData.user",
        },
      },
      {
        $unwind: "$postData.user"
      },
      {
        $addFields: {
          "postData.likesCount": { $size: "$postData.likes" },
          "postData.commentsCount": { $size: "$postData.comments" },
          "postData.isLikedByUser": {
            $cond: {
              if: {
                $in: [
                  new mongoose.Types.ObjectId(user._id),
                  "$postData.likes.user",
                ],
              },
              then: true,
              else: false,
            },
          },
          "postData.isCommentedByUser": {
            $cond: {
              if: {
                $in: [
                  new mongoose.Types.ObjectId(user._id),
                  "$postData.comments.user",
                ],
              },
              then: true,
              else: false,
            },
          },
          "postData.isFavorited": true,
        },
      },
      {
        $sort: sortObj
      },
    ];

    // Get total count
    const countPipeline = [...aggregationPipeline, { $count: "total" }];

    // Add pagination
    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: limitNum });

    aggregationPipeline.push({
      $project: {
        _id: 1,
        favoriteId: "$_id",
        createdAt: 1,
        post: {
          _id: "$postData._id",
          user: {
            _id: "$postData.user._id",
            fullName: { $concat: ["$postData.user.firstName", " ", "$postData.user.lastName"] },
            firstName: "$postData.user.firstName",
            lastName: "$postData.user.lastName",
            email: "$postData.user.email",
            profilePhoto: "$postData.user.profilePhoto",
          },
          caption: "$postData.caption",
          media: "$postData.media",
          likesCount: "$postData.likesCount",
          commentsCount: "$postData.commentsCount",
          isLikedByUser: "$postData.isLikedByUser",
          isCommentedByUser: "$postData.isCommentedByUser",
          isFavorited: "$postData.isFavorited",
          createdAt: "$postData.createdAt",
          updatedAt: "$postData.updatedAt",
        },
      },
    });

    const [favorites, countResult] = await Promise.all([
      Favorite.aggregate(aggregationPipeline),
      Favorite.aggregate(countPipeline),
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const responseData = {
      favorites,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalFavorites: totalCount,
        hasNextPage,
        hasPrevPage,
        limit: limitNum,
      },
      filters: {
        sortBy,
      },
    };

    // Cache the result for 10 minutes
    await cacheService.set(cacheKey, responseData, 600);

    return res.status(200).json({
      success: true,
      message: "Favorite posts fetched successfully",
      data: responseData,
    });
  }
);

// Check if post is favorited by user
export const checkFavorite = asyncHandler<CheckFavoriteRequest, Response>(
  async (req, res) => {
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

    // Check if favorited
    const favorite = await Favorite.findOne({
      user: user._id,
      post: postId,
    });

    return res.status(200).json({
      success: true,
      message: "Favorite status checked successfully",
      data: {
        isFavorited: !!favorite,
        postId: postId,
        userId: user._id,
        favoriteId: favorite?._id || null,
        favoritedAt: favorite?.createdAt || null,
      },
    });
  }
);

// Get favorite posts count for a user
export const getFavoritesCount = asyncHandler<any, Response>(
  async (req, res) => {
    const user = req.user;

    if (!user) {
      throw new AppError("User not authenticated", 401);
    }

    const count = await Favorite.countDocuments({ user: user._id });

    return res.status(200).json({
      success: true,
      message: "Favorites count fetched successfully",
      data: {
        userId: user._id,
        favoritesCount: count,
      },
    });
  }
);
