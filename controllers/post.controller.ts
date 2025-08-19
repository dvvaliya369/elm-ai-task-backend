import { Response } from "express";
import mongoose from "mongoose";
import Post from "../models/postSchema/post.schema";
import {
  uploadToCloud,
  generateUniqueFileName,
  getMediaType,
} from "../utils/fileUpload";
import { CreatePostRequest, GetPostsRequest } from "./interface";
import asyncHandler, { AppError } from "../service/asyncHandler";

export const createPost = asyncHandler<CreatePostRequest, Response>(
  async (req, res) => {
    const { caption } = req.body;
    const file = req.file;
    const user = req.user;

    if (!caption && !file) {
      throw new AppError("Either caption or media file is required", 400);
    }

    if (!user) {
      throw new AppError("User not authenticated", 401);
    }

    const postData: any = {
      user: user._id,
      likes: [],
      comments: [],
    };

    if (caption) {
      postData.caption = caption;
    }

    if (file) {
      const mediaUrl = await uploadToCloud(file);
      const uniqueFileName = generateUniqueFileName(file.originalname);
      const mediaType = getMediaType(file);

      postData.media = {
        url: mediaUrl,
        name: uniqueFileName,
        type: file.mimetype,
        size: file.size,
        mediaType,
      };
    }

    const newPost = await Post.create(postData);
    await newPost.populate("user", "firstName lastName email");

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  }
);

export const updatePost = asyncHandler<CreatePostRequest, Response>(
  async (req, res) => {
    const { id } = req.params;
    const { caption } = req.body;
    const file = req.file;
    const user = req.user;

    if (!user) {
      throw new AppError("User not authenticated", 401);
    }

    if (!caption && !file) {
      throw new AppError("Either caption or media file is required", 400);
    }

    const post = await Post.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.user.toString() !== user._id.toString()) {
      throw new AppError("Not authorized to update this post", 403);
    }

    if (caption) {
      post.caption = caption;
    }

    if (file) {
      const mediaUrl = await uploadToCloud(file);
      const uniqueFileName = generateUniqueFileName(file.originalname);
      const mediaType = getMediaType(file);

      post.media = {
        url: mediaUrl,
        name: uniqueFileName,
        type: file.mimetype,
        size: file.size,
        mediaType,
      };
    }

    await post.save();
    await post.populate("user", "firstName lastName email");

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  }
);

export const deletePost = asyncHandler<CreatePostRequest, Response>(
  async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    if (!user) {
      throw new AppError("User not authenticated", 401);
    }

    const post = await Post.findById(id);
    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.user.toString() !== user._id.toString()) {
      throw new AppError("Not authorized to delete this post", 403);
    }

    post.isDeleted = true;
    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  }
);

export const getPosts = asyncHandler<GetPostsRequest, Response>(
  async (req, res) => {
    const {
      page = "1",
      limit = "10",
      search,
      userId,
      mediaType,
      sortBy = "newest",
      minLikes = "0",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const minLikesNum = parseInt(minLikes);
    const skip = (pageNum - 1) * limitNum;

    const initialQuery: any = { isDeleted: { $ne: true } };

    if (userId) {
      initialQuery.user = new mongoose.Types.ObjectId(userId);
    }

    if (mediaType) {
      initialQuery["media.mediaType"] = mediaType;
    }

    let sortObj: any = {};
    switch (sortBy) {
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "popular":
        sortObj = { likesCount: -1, createdAt: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const aggregationPipeline: any[] = [
      { $match: initialQuery },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
        },
      },
    ];

    if (search) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { caption: { $regex: search, $options: "i" } },
            { "user.firstName": { $regex: search, $options: "i" } },
            { "user.lastName": { $regex: search, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: ["$user.firstName", " ", "$user.lastName"],
                  },
                  regex: search,
                  options: "i",
                },
              },
            },
          ],
        },
      });
    }

    if (minLikesNum > 0) {
      aggregationPipeline.push({
        $match: {
          likesCount: { $gte: minLikesNum },
        },
      });
    }

    const countPipeline = [...aggregationPipeline, { $count: "total" }];

    aggregationPipeline.push({ $sort: sortObj });
    aggregationPipeline.push({ $skip: skip });
    aggregationPipeline.push({ $limit: limitNum });

    aggregationPipeline.push({
      $project: {
        _id: 1,
        user: {
          _id: "$user._id",
          fullName: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          email: "$user.email",
          profilePhoto: "$user.profilePhoto",
        },
        caption: 1,
        media: 1,
        likesCount: 1,
        commentsCount: 1,
        createdAt: 1,
        updatedAt: 1,
        likes: 1,
      },
    });

    const [posts, countResult] = await Promise.all([
      Post.aggregate(aggregationPipeline),
      Post.aggregate(countPipeline),
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      data: {
        posts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPosts: totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum,
        },
        filters: {
          search: search || null,
          userId: userId || null,
          mediaType: mediaType || null,
          sortBy,
          minLikes: minLikesNum,
        },
      },
    });
  }
);

export const getPostById = asyncHandler<GetPostsRequest, Response>(
  async (req, res) => {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate("user", "firstName lastName profilePhoto")
      .populate("comments.user", "firstName lastName profilePhoto");

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: post,
    });
  }
);
