import express, { Router, RequestHandler } from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { handleMulterError } from "../middleware/multerError.middleware";

const router: Router = express.Router();

router.get("/me", authMiddleware, getProfile);
router.get("/:id", getProfile);

router.use("/update", authMiddleware);
router.put(
  "/update",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  updateProfile
);



export default router;
