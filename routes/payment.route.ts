import express from 'express';
import PaymentController from '../controllers/payment.controller';
import authMiddleware from '../middleware/auth.middleware';
import { 
  validateAmountMiddleware, 
  validateCurrencyMiddleware, 
  paymentRateLimitMiddleware 
} from '../middleware/payment.middleware';

const router = express.Router();

// Protected routes - require authentication
router.post(
  '/create-order', 
  authMiddleware, 
  validateAmountMiddleware, 
  validateCurrencyMiddleware, 
  paymentRateLimitMiddleware,
  PaymentController.createOrder
);

router.post('/verify-payment', authMiddleware, PaymentController.verifyPayment);
router.get('/status/:orderId', authMiddleware, PaymentController.getPaymentStatus);
router.get('/transactions', authMiddleware, PaymentController.getUserTransactions);

// Public webhook route - no authentication required
router.post('/webhook', PaymentController.handleWebhook);

export default router;
