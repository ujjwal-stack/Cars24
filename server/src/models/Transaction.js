// server/src/models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['booking', 'full_payment', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'bank_transfer', 'cash', 'upi'],
    required: true
  },
  paymentDetails: {
    paymentId: String,
    orderId: String,
    signature: String,
    method: String,
    cardLast4: String,
    upiId: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  bookingAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    default: 0
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  platformFee: {
    type: Number,
    default: 0
  },
  gst: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String,
    generatedAt: Date
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  refundDetails: {
    reason: String,
    requestedAt: Date,
    processedAt: Date,
    refundId: String
  },
  completedAt: Date,
  failedReason: String
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ buyerId: 1, createdAt: -1 });
transactionSchema.index({ sellerId: 1, createdAt: -1 });
transactionSchema.index({ carId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ 'paymentDetails.paymentId': 1 });

// Virtual for net amount to seller
transactionSchema.virtual('sellerAmount').get(function() {
  return this.amount - this.platformFee - this.gst;
});

// Add timeline entry
transactionSchema.methods.addTimelineEntry = function(status, description, userId) {
  this.timeline.push({
    status,
    description,
    updatedBy: userId,
    timestamp: new Date()
  });
};

// Mark as completed
transactionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.addTimelineEntry('completed', 'Transaction completed successfully');
  return this.save();
};

// Process refund
transactionSchema.methods.processRefund = async function(reason, refundId) {
  this.status = 'refunded';
  this.refundDetails = {
    reason,
    requestedAt: this.refundDetails?.requestedAt || new Date(),
    processedAt: new Date(),
    refundId
  };
  this.addTimelineEntry('refunded', `Refund processed: ${reason}`);
  return this.save();
};

module.exports = mongoose.model('Transaction', transactionSchema);