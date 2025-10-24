import mongoose from 'mongoose';

// Transaction interface
export interface ITransaction {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  paymentId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'attempted' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  method?: string; // card, netbanking, wallet, etc.
  paymentSignature?: string;
  failureReason?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Order interface
export interface IOrder {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid' | 'cancelled';
  razorpayOrderId?: string;
  description?: string;
  notes?: any;
  createdAt: Date;
  updatedAt: Date;
}

// Payment verification interface
export interface IPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Create order request interface
export interface ICreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  description?: string;
  notes?: any;
}
