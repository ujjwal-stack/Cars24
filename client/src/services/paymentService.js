// client/src/services/paymentService.js
import api from './api';

class PaymentService {
  // Create payment order
  async createOrder(orderData) {
    const response = await api.post('/payments/create-order', orderData);
    return response.data;
  }

  // Verify payment
  async verifyPayment(verificationData) {
    const response = await api.post('/payments/verify', verificationData);
    return response.data;
  }

  // Get user transactions
  async getUserTransactions(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/payments/transactions?${queryParams.toString()}`);
    return response.data;
  }

  // Get transaction by ID
  async getTransactionById(transactionId) {
    const response = await api.get(`/payments/transactions/${transactionId}`);
    return response.data;
  }

  // Request refund
  async requestRefund(transactionId, reason) {
    const response = await api.post(`/payments/transactions/${transactionId}/refund`, {
      reason
    });
    return response.data;
  }

  // Generate invoice
  async generateInvoice(transactionId) {
    const response = await api.get(`/payments/transactions/${transactionId}/invoice`);
    return response.data;
  }

  // Format price
  formatPrice(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  // Calculate platform fee
  calculatePlatformFee(amount) {
    return Math.round(amount * 0.02); // 2%
  }

  // Calculate GST
  calculateGST(platformFee) {
    return Math.round(platformFee * 0.18); // 18%
  }

  // Calculate total amount
  calculateTotal(amount) {
    const platformFee = this.calculatePlatformFee(amount);
    const gst = this.calculateGST(platformFee);
    return amount + platformFee + gst;
  }
}

export const paymentService = new PaymentService();
export default paymentService;