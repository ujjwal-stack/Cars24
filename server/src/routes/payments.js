// server/src/routes/payments.js
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createPaymentOrder,
  verifyPayment,
  getUserTransactions,
  getTransactionById,
  requestRefund,
  generateInvoice
} = require('../controllers/paymentController');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/transactions', getUserTransactions);
router.get('/transactions/:id', getTransactionById);
router.post('/transactions/:id/refund', requestRefund);
router.get('/transactions/:id/invoice', generateInvoice);

module.exports = router;