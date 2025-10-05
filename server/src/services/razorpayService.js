// server/src/services/razorpayService.js
const Razorpay = require('razorpay');
const crypto = require('crypto');

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  /**
   * Create payment order
   */
  async createOrder(orderData) {
    try {
      const { amount, currency = 'INR', notes = {} } = orderData;

      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
        notes
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay create order error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify payment signature
   */
  verifySignature(orderId, paymentId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Get payment details error:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  /**
   * Create refund
   */
  async createRefund(paymentId, amount, notes = {}) {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount * 100, // Convert to paise
        notes
      });
      return refund;
    } catch (error) {
      console.error('Refund creation error:', error);
      throw new Error('Failed to create refund');
    }
  }

  /**
   * Get refund details
   */
  async getRefundDetails(refundId) {
    try {
      const refund = await this.razorpay.refunds.fetch(refundId);
      return refund;
    } catch (error) {
      console.error('Get refund details error:', error);
      throw new Error('Failed to fetch refund details');
    }
  }

  /**
   * Capture payment
   */
  async capturePayment(paymentId, amount, currency = 'INR') {
    try {
      const capture = await this.razorpay.payments.capture(
        paymentId,
        amount * 100, // Convert to paise
        currency
      );
      return capture;
    } catch (error) {
      console.error('Payment capture error:', error);
      throw new Error('Failed to capture payment');
    }
  }

  /**
   * Get all payments
   */
  async getAllPayments(options = {}) {
    try {
      const payments = await this.razorpay.payments.all(options);
      return payments;
    } catch (error) {
      console.error('Get all payments error:', error);
      throw new Error('Failed to fetch payments');
    }
  }
}

module.exports = new RazorpayService();