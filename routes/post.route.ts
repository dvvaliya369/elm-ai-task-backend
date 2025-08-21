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
router.post(
  "/create",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  createPost
);

router.use("/update", authMiddleware);
router.put(
  "/update/:id",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  updatePost
);

router.use("/delete", authMiddleware);
router.delete("/delete/:id", deletePost);

router.use("/like", authMiddleware);
router.put("/like/:id", likePost);

router.use("/comment", authMiddleware);
router.put("/comment/:id", commentPost);
router.delete("/comment/:id", deleteComment);

router.use("/list", authOptionalMiddleware);
router.get("/list", getPosts);
router.get("/:id", authOptionalMiddleware, getPostById);

router.get("/user/:id", authOptionalMiddleware, getPostByUserId);

export default router;
