import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/orders', authMiddleware, createOrder);
router.post('/verify', authMiddleware, verifyPayment);

export default router;
