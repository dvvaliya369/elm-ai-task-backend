import express, { Router, RequestHandler } from "express";
import {
  createPost,
  updatePost,
  deletePost,
  getPostById,
  getPosts,
  likePost,
  commentPost,
  deleteComment,
  getPostByUserId,
} from "../controllers/post.controller";
import { authMiddleware, authOptionalMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { handleMulterError } from "../middleware/multerError.middleware";

const router: Router = express.Router();

/**
 * @swagger
 * /api/post/create:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post with optional caption and media file (image or video)
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *                 description: Post caption text
 *                 example: Beautiful sunset at the beach!
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Media file (image or video). Max 5MB for images, 50MB for videos. Supported formats - Images (JPEG, PNG, GIF, WebP), Videos (MP4, MPEG, QuickTime, AVI)
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Post created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noContent:
 *                 value:
 *                   success: false
 *                   message: Please provide at least caption or media
 *                   statusCode: 400
 *               fileTooLarge:
 *                 value:
 *                   success: false
 *                   message: File size exceeds limit
 *                   statusCode: 400
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.use("/create", authMiddleware);
router.post(
  "/create",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  createPost
);

/**
 * @swagger
 * /api/post/update/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update post caption and/or media file. User can only update their own posts.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 64f8a3b2c9d8e1234567890b
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *                 description: Updated post caption
 *                 example: Updated caption text
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New media file (replaces existing media)
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Post updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not authorized to update this post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: You are not authorized to update this post
 *               statusCode: 403
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.use("/update", authMiddleware);
router.put(
  "/update/:id",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  updatePost
);

/**
 * @swagger
 * /api/post/delete/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Soft delete a post (sets isDeleted flag). User can only delete their own posts.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 64f8a3b2c9d8e1234567890b
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Post deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not authorized to delete this post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: You are not authorized to delete this post
 *               statusCode: 403
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.use("/delete", authMiddleware);
router.delete("/delete/:id", deletePost);

/**
 * @swagger
 * /api/post/like/{id}:
 *   put:
 *     summary: Like or unlike a post
 *     description: Toggle like on a post. If user already liked the post, it will be unliked. If not liked, it will be liked.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 64f8a3b2c9d8e1234567890b
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Post liked successfully
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.use("/like", authMiddleware);
router.put("/like/:id", likePost);

/**
 * @swagger
 * /api/post/comment/{id}:
 *   put:
 *     summary: Add a comment to a post
 *     description: Add a new comment to a post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 64f8a3b2c9d8e1234567890b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Comment text
 *                 example: Amazing photo!
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Comment added successfully
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.use("/comment", authMiddleware);
router.put("/comment/:id", commentPost);

/**
 * @swagger
 * /api/post/comment/{id}:
 *   delete:
 *     summary: Delete a comment from a post
 *     description: Delete a specific comment from a post. User can only delete their own comments.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 64f8a3b2c9d8e1234567890b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commentId
 *             properties:
 *               commentId:
 *                 type: string
 *                 description: Comment ID to delete
 *                 example: 64f8a3b2c9d8e1234567890d
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Comment deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not authorized to delete this comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: You are not authorized to delete this comment
 *               statusCode: 403
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete("/comment/:id", deleteComment);

/**
 * @swagger
 * /api/post/list:
 *   get:
 *     summary: Get all posts with advanced filtering
 *     description: Retrieve a paginated list of posts with optional search, filters, and sorting. Authentication is optional - authenticated users will see personalized data.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of posts per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in post captions and user names
 *         example: sunset
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by specific user ID
 *         example: 64f8a3b2c9d8e1234567890a
 *       - in: query
 *         name: mediaType
 *         schema:
 *           type: string
 *           enum: [image, video]
 *         description: Filter by media type
 *         example: image
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, popular]
 *           default: newest
 *         description: Sort order (newest = recent first, oldest = oldest first, popular = most likes)
 *         example: popular
 *       - in: query
 *         name: minLikes
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum number of likes
 *         example: 5
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Posts retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalPosts:
 *                           type: integer
 *                           example: 50
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.use("/list", authOptionalMiddleware);
router.get("/list", getPosts);

/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieve a single post by its ID. Uses Redis caching for improved performance. Authentication is optional.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *         example: 64f8a3b2c9d8e1234567890b
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Post retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", authOptionalMiddleware, getPostById);

/**
 * @swagger
 * /api/post/user/{id}:
 *   get:
 *     summary: Get all posts by a specific user
 *     description: Retrieve all posts created by a specific user with pagination and advanced filtering options. Authentication is optional.
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 64f8a3b2c9d8e1234567890a
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of posts per page
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field (e.g., createdAt, likes)
 *         example: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *         example: desc
 *       - in: query
 *         name: filters
 *         schema:
 *           type: string
 *         description: JSON string of FilterItem[] for advanced filtering
 *         example: '[{"field":"mediaType","operator":"eq","value":"image"}]'
 *     responses:
 *       200:
 *         description: User posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User posts retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *                         totalPosts:
 *                           type: integer
 *                           example: 25
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: User not found
 *               statusCode: 404
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/user/:id", authOptionalMiddleware, getPostByUserId);

export default router;
