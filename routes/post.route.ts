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
import { authenticateJWT } from "../middleware/passport.middleware";
import { authOptionalMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { handleMulterError } from "../middleware/multerError.middleware";

const router: Router = express.Router();

router.use("/create", authenticateJWT);
router.post(
  "/create",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  createPost
);

router.use("/update", authenticateJWT);
router.put(
  "/update/:id",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  updatePost
);

router.use("/delete", authenticateJWT);
router.delete("/delete/:id", deletePost);

router.use("/like", authenticateJWT);
router.put("/like/:id", likePost);

router.use("/comment", authenticateJWT);
router.put("/comment/:id", commentPost);
router.delete("/comment/:id", deleteComment);

router.use("/list", authOptionalMiddleware);
router.get("/list", getPosts);
router.get("/:id", authOptionalMiddleware, getPostById);

router.get("/user/:id", authOptionalMiddleware, getPostByUserId);

export default router;
