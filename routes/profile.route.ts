import express, { Router, RequestHandler } from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { handleMulterError } from "../middleware/multerError.middleware";

const router: Router = express.Router();

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user's profile
 *     description: Retrieve the profile information for the authenticated user. Uses Redis caching for improved performance.
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                   example: Profile retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/me", authMiddleware, getProfile);

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     description: Retrieve profile information for any user by their ID. Uses Redis caching for improved performance.
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: 64f8a3b2c9d8e1234567890a
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                   example: Profile retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get("/:id", getProfile);

/**
 * @swagger
 * /api/profile/update:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information including firstName, lastName, and profile photo
 *     tags: [Profiles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Updated first name
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: Updated last name
 *                 example: Doe
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New profile photo (max 5MB). Supported formats - JPEG, PNG, GIF, WebP
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noUpdate:
 *                 value:
 *                   success: false
 *                   message: Please provide at least one field to update
 *                   statusCode: 400
 *               invalidFile:
 *                 value:
 *                   success: false
 *                   message: Invalid file format
 *                   statusCode: 400
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.use("/update", authMiddleware);
router.put(
  "/update",
  upload.single("file") as unknown as RequestHandler,
  handleMulterError,
  updateProfile
);

export default router;
