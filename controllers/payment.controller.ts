import { Request, Response } from 'express';
import crypto from 'crypto';
import razorpay from '../config/razorpay.config';
import envConfig from '../config/env.config';
import { Transaction, Order } from '../models/paymentSchema/payment.schema';
import { ICreateOrderRequest, IPaymentVerification } from '../models/paymentSchema/type.paymentSchema';
import asyncHandler from '../service/asyncHandler';

class PaymentController {
  // Create Razorpay Order
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { amount, currency = 'INR', receipt, description, notes }: ICreateOrderRequest = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    try {
      // Generate unique receipt if not provided
      const orderReceipt = receipt || `receipt_${Date.now()}_${userId}`;

      // Create order in our database first
      const order = new Order({
        userId,
        amount: amount * 100, // Convert to paise
        currency,
        receipt: orderReceipt,
        description,
        notes,
        status: 'created',
      });

      await order.save();

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // Amount in paise
        currency,
        receipt: orderReceipt,
        notes: {
          ...notes,
          userId,
          orderId: order._id.toString(),
        },
      });

      // Update order with Razorpay order ID
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      // Create initial transaction record
      const transaction = new Transaction({
        userId,
        orderId: razorpayOrder.id,
        amount: amount * 100,
        currency,
        status: 'created',
        metadata: {
          orderDbId: order._id.toString(),
        },
      });

      await transaction.save();

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
          key: envConfig.RAZORPAY_KEY_ID, // Frontend needs this for checkout
        },
      });
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message,
      });
    }
  });

  // Verify Payment
  verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature }: IPaymentVerification = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data',
      });
    }

    try {
      // Generate signature for verification
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', envConfig.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        // Update transaction as failed
        await Transaction.findOneAndUpdate(
          { orderId: razorpay_order_id, userId },
          {
            status: 'failed',
            failureReason: 'Invalid payment signature',
            updatedAt: new Date(),
          }
        );

        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature',
        });
      }

      // Payment is authentic, update records
      const transaction = await Transaction.findOneAndUpdate(
        { orderId: razorpay_order_id, userId },
        {
          paymentId: razorpay_payment_id,
          paymentSignature: razorpay_signature,
          status: 'paid',
          updatedAt: new Date(),
        },
        { new: true }
      );

      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id, userId },
        {
          status: 'paid',
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!transaction || !order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Fetch payment details from Razorpay
      try {
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        
        // Update transaction with payment method
        transaction.method = payment.method;
        await transaction.save();
      } catch (fetchError) {
        console.error('Error fetching payment details:', fetchError);
        // Don't fail the verification if we can't fetch payment details
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          transactionId: transaction._id,
          orderId: order._id,
          amount: transaction.amount / 100, // Convert back to rupees
          currency: transaction.currency,
          status: 'paid',
        },
      });
    } catch (error: any) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: error.message,
      });
    }
  });

  // Get Payment Status
  getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    try {
      const transaction = await Transaction.findOne({
        orderId,
        userId,
      }).populate('userId', 'email name');

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          transactionId: transaction._id,
          orderId: transaction.orderId,
          paymentId: transaction.paymentId,
          amount: transaction.amount / 100,
          currency: transaction.currency,
          status: transaction.status,
          method: transaction.method,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        },
      });
    } catch (error: any) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment status',
        error: error.message,
      });
    }
  });

  // Get User Transactions
  getUserTransactions = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { page = 1, limit = 10, status } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    try {
      const query: any = { userId };
      if (status) {
        query.status = status;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-paymentSignature'); // Don't expose signature in list

      const totalTransactions = await Transaction.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          transactions: transactions.map(t => ({
            transactionId: t._id,
            orderId: t.orderId,
            paymentId: t.paymentId,
            amount: t.amount / 100,
            currency: t.currency,
            status: t.status,
            method: t.method,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          })),
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalTransactions / Number(limit)),
            totalTransactions,
            limit: Number(limit),
          },
        },
      });
    } catch (error: any) {
      console.error('Get user transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions',
        error: error.message,
      });
    }
  });

  // Webhook handler for Razorpay events
  handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookBody = JSON.stringify(req.body);

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: 'Webhook signature missing',
      });
    }

    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', envConfig.RAZORPAY_WEBHOOK_SECRET)
        .update(webhookBody)
        .digest('hex');

      const isAuthentic = expectedSignature === webhookSignature;

      if (!isAuthentic) {
        return res.status(400).json({
          success: false,
          message: 'Invalid webhook signature',
        });
      }

      const { event, payload } = req.body;

      // Handle different webhook events
      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload.payment.entity);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload.payment.entity);
          break;
        case 'order.paid':
          await this.handleOrderPaid(payload.order.entity);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Webhook handling error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message,
      });
    }
  });

  private handlePaymentCaptured = async (payment: any) => {
    try {
      await Transaction.findOneAndUpdate(
        { orderId: payment.order_id },
        {
          paymentId: payment.id,
          status: 'paid',
          method: payment.method,
          updatedAt: new Date(),
        }
      );

      await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          status: 'paid',
          updatedAt: new Date(),
        }
      );

      console.log(`Payment captured: ${payment.id}`);
    } catch (error) {
      console.error('Error handling payment captured:', error);
    }
  };

  private handlePaymentFailed = async (payment: any) => {
    try {
      await Transaction.findOneAndUpdate(
        { orderId: payment.order_id },
        {
          paymentId: payment.id,
          status: 'failed',
          method: payment.method,
          failureReason: payment.error_description || 'Payment failed',
          updatedAt: new Date(),
        }
      );

      console.log(`Payment failed: ${payment.id}`);
    } catch (error) {
      console.error('Error handling payment failed:', error);
    }
  };

  private handleOrderPaid = async (order: any) => {
    try {
      await Order.findOneAndUpdate(
        { razorpayOrderId: order.id },
        {
          status: 'paid',
          updatedAt: new Date(),
        }
      );

      console.log(`Order paid: ${order.id}`);
    } catch (error) {
      console.error('Error handling order paid:', error);
    }
  };
}

export default new PaymentController();
