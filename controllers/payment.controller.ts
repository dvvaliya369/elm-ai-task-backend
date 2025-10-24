import { Response } from 'express';
import asyncHandler, { AppError } from '../service/asyncHandler';
import { razorpayService } from '../service/razorpay.service';

interface ICreateOrderRequest extends Express.Request {
  body: {
    amount: number;
  };
}

interface IVerifyPaymentRequest extends Express.Request {
  body: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  };
}

export const createOrder = asyncHandler<ICreateOrderRequest, Response>(
  async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
      throw new AppError('Amount is required', 400);
    }

    const order = await razorpayService.createOrder(amount);

    return res.status(200).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.id,
      },
    });
  }
);

export const verifyPayment = asyncHandler<IVerifyPaymentRequest, Response>(
  async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new AppError('Order ID, Payment ID, and Signature are required', 400);
    }

    const isPaymentValid = await razorpayService.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isPaymentValid) {
      throw new AppError('Invalid payment signature', 400);
    }

    // TODO: Update order status in your database

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
    });
  }
);
