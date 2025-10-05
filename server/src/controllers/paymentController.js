// server/src/controllers/paymentController.js
const Transaction = require('../models/Transaction');
const Car = require('../models/Car');
const razorpayService = require('../services/razorpayService');

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res) => {
  try {
    const { carId, amount, transactionType = 'booking' } = req.body;
    const buyerId = req.user.userId;

    // Validate car
    const car = await Car.findById(carId).populate('sellerId');
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    if (car.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for purchase'
      });
    }

    // Check if buyer is not the seller
    if (car.sellerId._id.toString() === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot buy your own car'
      });
    }

    // Calculate amounts
    const platformFee = Math.round(amount * 0.02); // 2% platform fee
    const gst = Math.round(platformFee * 0.18); // 18% GST on platform fee
    const totalAmount = amount + platformFee + gst;

    // Create Razorpay order
    const order = await razorpayService.createOrder({
      amount: totalAmount,
      currency: 'INR',
      notes: {
        carId: carId,
        buyerId: buyerId,
        transactionType: transactionType
      }
    });

    // Create transaction record
    const transaction = await Transaction.create({
      carId,
      buyerId,
      sellerId: car.sellerId._id,
      transactionType,
      amount,
      paymentMethod: 'razorpay',
      paymentDetails: {
        orderId: order.id
      },
      platformFee,
      gst,
      totalAmount,
      status: 'pending'
    });

    transaction.addTimelineEntry('pending', 'Payment order created', buyerId);
    await transaction.save();

    res.status(201).json({
      success: true,
      data: {
        order,
        transaction: transaction._id,
        amount: totalAmount
      }
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, transactionId } = req.body;
    const userId = req.user.userId;

    // Verify signature
    const isValid = razorpayService.verifySignature(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get transaction
    const transaction = await Transaction.findById(transactionId).populate('carId');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify buyer
    if (transaction.buyerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Get payment details from Razorpay
    const payment = await razorpayService.getPaymentDetails(paymentId);

    // Update transaction
    transaction.status = 'completed';
    transaction.paymentDetails = {
      ...transaction.paymentDetails,
      paymentId,
      signature,
      method: payment.method,
      cardLast4: payment.card?.last4,
      upiId: payment.vpa
    };
    transaction.completedAt = new Date();
    transaction.addTimelineEntry('completed', 'Payment successful', userId);
    await transaction.save();

    // If full payment, mark car as sold
    if (transaction.transactionType === 'full_payment') {
      const car = await Car.findById(transaction.carId);
      if (car) {
        car.status = 'sold';
        car.soldAt = new Date();
        car.soldPrice = transaction.amount;
        car.soldTo = userId;
        await car.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { transaction }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user transactions
// @route   GET /api/payments/transactions
// @access  Private
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status, type } = req.query;

    const query = {
      $or: [{ buyerId: userId }, { sellerId: userId }]
    };

    if (status) query.status = status;
    if (type) query.transactionType = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .populate('carId', 'basicInfo pricing images')
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/payments/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user.userId;

    const transaction = await Transaction.findById(transactionId)
      .populate('carId', 'basicInfo pricing images')
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify user is buyer or seller
    if (transaction.buyerId._id.toString() !== userId && 
        transaction.sellerId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { transaction }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Request refund
// @route   POST /api/payments/transactions/:id/refund
// @access  Private
const requestRefund = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user.userId;
    const { reason } = req.body;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Only buyer can request refund
    if (transaction.buyerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer can request refund'
      });
    }

    // Check if already refunded
    if (transaction.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already refunded'
      });
    }

    // Process refund through Razorpay
    const refund = await razorpayService.createRefund(
      transaction.paymentDetails.paymentId,
      transaction.totalAmount
    );

    // Update transaction
    await transaction.processRefund(reason, refund.id);
    transaction.addTimelineEntry('refunded', `Refund requested: ${reason}`, userId);
    await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: { transaction }
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Generate invoice
// @route   GET /api/payments/transactions/:id/invoice
// @access  Private
const generateInvoice = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user.userId;

    const transaction = await Transaction.findById(transactionId)
      .populate('carId', 'basicInfo pricing')
      .populate('buyerId', 'name email phone profile.location')
      .populate('sellerId', 'name email phone profile.location');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Verify user is buyer or seller
    if (transaction.buyerId._id.toString() !== userId && 
        transaction.sellerId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Invoice can only be generated for completed transactions'
      });
    }

    // Generate invoice number if not exists
    if (!transaction.invoice.invoiceNumber) {
      const invoiceNumber = `INV-${Date.now()}-${transaction._id.toString().slice(-6)}`;
      transaction.invoice.invoiceNumber = invoiceNumber;
      transaction.invoice.generatedAt = new Date();
      await transaction.save();
    }

    res.status(200).json({
      success: true,
      data: {
        invoice: {
          invoiceNumber: transaction.invoice.invoiceNumber,
          date: transaction.invoice.generatedAt,
          transaction: transaction
        }
      }
    });

  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getUserTransactions,
  getTransactionById,
  requestRefund,
  generateInvoice
};