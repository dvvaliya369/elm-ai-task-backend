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

router.use("/create", authMiddleware);
/**
 * @openapi
 * /api/post/create:
 *   post:
 *     summary: Create a new post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post.
 *               content:
 *                 type: string
 *                 description: The content of the post.
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the post.
 *     responses:
 *       201:
 *         description: Post created successfully.
 *       400:
 *         description: Bad request. Invalid input.
 *       401:
 *         description: Unauthorized.
 */
router.post(
  "/create",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  createPost
);

router.use("/update", authMiddleware);
/**
 * @openapi
 * /api/post/update/{id}:
 *   put:
 *     summary: Update an existing post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The updated title of the post.
 *               content:
 *                 type: string
 *                 description: The updated content of the post.
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The updated image file for the post.
 *     responses:
 *       200:
 *         description: Post updated successfully.
 *       400:
 *         description: Bad request. Invalid input.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Post not found.
 */
router.put(
  "/update/:id",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  updatePost
);

router.use("/delete", authMiddleware);
/**
 * @openapi
 * /api/post/delete/{id}:
 *   delete:
 *     summary: Delete an existing post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete.
 *     responses:
 *       204:
 *         description: Post deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Post not found.
 */
router.delete("/delete/:id", deletePost);

router.use("/like", authMiddleware);
/**
 * @openapi
 * /api/post/like/{id}:
 *   put:
 *     summary: Like/unlike an existing post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to like/unlike.
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Post not found.
 */
router.put("/like/:id", likePost);

router.use("/comment", authMiddleware);
/**
 * @openapi
 * /api/post/comment/{id}:
 *   put:
 *     summary: Add a comment to an existing post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to comment on.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The comment text.
 *     responses:
 *       200:
 *         description: Comment added successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Post not found.
 */
router.put("/comment/:id", commentPost);
/**
 * @openapi
 * /api/post/comment/{id}:
 *   delete:
 *     summary: Delete a comment from an existing post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete.
 *     responses:
 *       204:
 *         description: Comment deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Comment not found.
 */
router.delete("/comment/:id", deleteComment);

router.use("/list", authOptionalMiddleware);
/**
 * @openapi
 * /api/post/list:
 *   get:
 *     summary: Get a list of all posts
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: A list of posts.
 */
router.get("/list", getPosts);
/**
 * @openapi
 * /api/post/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Post]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve.
 *     responses:
 *       200:
 *         description: The requested post.
 *       404:
 *         description: Post not found.
 */
router.get("/:id", authOptionalMiddleware, getPostById);

router.get("/user/:id", authOptionalMiddleware, getPostByUserId);

export default router;
