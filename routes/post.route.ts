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
  likeComment,
} from "../controllers/post.controller";
import { authMiddleware, authOptionalMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { handleMulterError } from "../middleware/multerError.middleware";

const router: Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management API
 */

/**
 * @swagger
 * /api/post/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Post title
 *               content:
 *                 type: string
 *                 description: Post content
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional file attachment
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
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Post title
 *               content:
 *                 type: string
 *                 description: Post content
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional file attachment
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
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
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
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
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.use("/delete", authMiddleware);
router.delete("/delete/:id", deletePost);

/**
 * @swagger
 * /api/post/like/{id}:
 *   put:
 *     summary: Like/unlike a post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post like/unlike successful
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
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.use("/like", authMiddleware);
router.put("/like/:id", likePost);

/**
 * @swagger
 * /api/post/comment/{id}:
 *   put:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Comment content
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *   delete:
 *     summary: Delete a comment from a post
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentId:
 *                 type: string
 *                 description: Comment ID to delete
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post/Comment not found
 */
router.use("/comment", authMiddleware);
router.put("/comment/:id", commentPost);
router.delete("/comment/:id", deleteComment);
/**
 * @swagger
 * /api/post/comment/{id}/like/{commentId}:
 *   put:
 *     summary: Like/unlike a comment
 *     tags: [Posts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment like/unlike successful
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
 *                   example: Comment liked successfully
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post/Comment not found
 */
router.put("/comment/:id/like/:commentId", likeComment);

/**
 * @swagger
 * /api/post/list:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
router.use("/list", authOptionalMiddleware);
router.get("/list", getPosts);
/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Post ID
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
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authOptionalMiddleware, getPostById);

/**
 * @swagger
 * /api/post/user/{id}:
 *   get:
 *     summary: Get posts by user ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/user/:id", authOptionalMiddleware, getPostByUserId);

export default router;
