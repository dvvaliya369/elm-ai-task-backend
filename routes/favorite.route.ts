import { Router } from "express";
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
  getFavoritesCount,
} from "../controllers/favorite.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Add post to favorites
router.post("/:postId", addToFavorites);

// Remove post from favorites
router.delete("/:postId", removeFromFavorites);

// Get user's favorite posts
router.get("/", getFavorites);

// Get favorites count
router.get("/count", getFavoritesCount);

// Check if post is favorited
router.get("/check/:postId", checkFavorite);

export default router;
