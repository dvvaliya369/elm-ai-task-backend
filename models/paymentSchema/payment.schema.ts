import mongoose, { Schema, Document } from 'mongoose';
import { ITransaction, IOrder } from './type.paymentSchema';

// Transaction Schema
const TransactionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'cancelled', 'refunded'],
    required: true,
    default: 'created',
  },
  method: {
    type: String, // card, netbanking, wallet, upi, etc.
  },
  paymentSignature: {
    type: String,
  },
  failureReason: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

// Order Schema
const OrderSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
  },
  receipt: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'cancelled'],
    required: true,
    default: 'created',
  },
  razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true, // allows multiple null values
  },
  description: {
    type: String,
  },
  notes: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ orderId: 1 });
TransactionSchema.index({ paymentId: 1 });
TransactionSchema.index({ status: 1 });

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ razorpayOrderId: 1 });
OrderSchema.index({ receipt: 1 });
OrderSchema.index({ status: 1 });

// Models
export const Transaction = mongoose.model<ITransaction & Document>('Transaction', TransactionSchema);
export const Order = mongoose.model<IOrder & Document>('Order', OrderSchema);
