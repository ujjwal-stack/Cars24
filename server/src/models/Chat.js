const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
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
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    buyerUnread: {
      type: Number,
      default: 0
    },
    sellerUnread: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ buyerId: 1, sellerId: 1, carId: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

// Check if chat already exists
chatSchema.statics.findExistingChat = async function(buyerId, sellerId, carId) {
  return await this.findOne({
    buyerId,
    sellerId,
    carId,
    status: 'active'
  });
};

module.exports = mongoose.model('Chat', chatSchema);