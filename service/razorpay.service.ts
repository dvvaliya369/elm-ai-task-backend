import Razorpay from 'razorpay';
import envConfig from '../config/env.config';
import crypto from 'crypto';

class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: envConfig.RAZORPAY_KEY_ID,
      key_secret: envConfig.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Creates a Razorpay order.
   * @param amount The amount in INR.
   * @param currency The currency (default: INR).
   * @returns The Razorpay order object.
   * @throws Error if there is an error creating the order.
   */
  async createOrder(amount: number, currency: string = 'INR'): Promise<any> {
    try {
      // Razorpay uses paise (100 paise = 1 INR), so multiply the amount by 100
      const order = await this.razorpay.orders.create({
        amount: amount * 100,
        currency,
        receipt: 'receipt#1',
        notes: {
          key1: 'value1',
          key2: 'value2',
        },
      });
      console.log('Razorpay order created:', order);
      return order;
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(error.message || 'Failed to create Razorpay order');
    }
  }

  /**
   * Verifies the payment signature.
   * @param razorpayOrderId The Razorpay order ID.
   * @param razorpayPaymentId The Razorpay payment ID.
   * @param razorpaySignature The Razorpay signature.
   * @returns True if the signature is valid, false otherwise.
   */
  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<boolean> {
    try {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', envConfig.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      // Compare the generated signature with the received signature
      if (expectedSignature === razorpaySignature) {
        console.log('Payment signature is valid');
        return true;
      } else {
        console.warn('Payment signature is invalid');
        return false;
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();
