import { razorpayService } from '../service/razorpay.service';
import Razorpay from 'razorpay';
import crypto from 'crypto';

describe('Razorpay Service', () => {
  it('should create a Razorpay order', async () => {
    const amount = 10;
    const order = await razorpayService.createOrder(amount);
    expect(order).toBeDefined();
    expect(order.amount).toBe(amount * 100);
  });

  it('should verify a valid payment signature', async () => {
    const razorpayOrderId = 'order_id'; // Replace with a valid order ID
    const razorpayPaymentId = 'payment_id'; // Replace with a valid payment ID
    const razorpaySignature = 'signature'; // Replace with a valid signature

    // Mock the createHmac function to return the expected signature
    const createHmacMock = jest.spyOn(crypto, 'createHmac');
    createHmacMock.mockImplementation(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue(razorpaySignature),
    } as any));

    const isValid = await razorpayService.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    expect(isValid).toBe(true);

    // Restore the original createHmac function
    createHmacMock.mockRestore();
  });

  it('should not verify an invalid payment signature', async () => {
    const razorpayOrderId = 'order_id'; // Replace with a valid order ID
    const razorpayPaymentId = 'payment_id'; // Replace with a valid payment ID
    const razorpaySignature = 'invalid_signature'; // Replace with an invalid signature

    // Mock the createHmac function to return a different signature
    const createHmacMock = jest.spyOn(crypto, 'createHmac');
    createHmacMock.mockImplementation(() => ({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('different_signature'),
    } as any));

    const isValid = await razorpayService.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    expect(isValid).toBe(false);

    // Restore the original createHmac function
    createHmacMock.mockRestore();
  });
});
