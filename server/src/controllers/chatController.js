// server/src/controllers/chatController.js
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Car = require('../models/Car');

// @desc    Get or create chat
// @route   POST /api/chats
// @access  Private
const getOrCreateChat = async (req, res) => {
  try {
    const { carId, sellerId } = req.body;
    const buyerId = req.user.userId;

    // Validate car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check if buyer is trying to chat with themselves
    if (buyerId === sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot chat with yourself'
      });
    }

    // Check if chat already exists
    let chat = await Chat.findExistingChat(buyerId, sellerId, carId);

    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        carId,
        buyerId,
        sellerId,
        participants: [
          { userId: buyerId },
          { userId: sellerId }
        ]
      });
    }

    // Populate chat details
    chat = await Chat.findById(chat._id)
      .populate('carId', 'basicInfo pricing images status')
      .populate('buyerId', 'name email phone profile.avatar')
      .populate('sellerId', 'name email phone profile.avatar');

    res.status(200).json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Get/Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all user chats
// @route   GET /api/chats
// @access  Private
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const chats = await Chat.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
      status: 'active'
    })
      .populate('carId', 'basicInfo pricing images status')
      .populate('buyerId', 'name email phone profile.avatar')
      .populate('sellerId', 'name email phone profile.avatar')
      .sort('-lastMessageAt')
      .lean();

    // Add unread count for current user
    const chatsWithUnread = chats.map(chat => {
      const isBuyer = chat.buyerId._id.toString() === userId;
      const unreadCount = isBuyer ? chat.unreadCount.buyerUnread : chat.unreadCount.sellerUnread;
      return { ...chat, unreadCount };
    });

    res.status(200).json({
      success: true,
      data: { chats: chatsWithUnread }
    });

  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
const getChatById = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId)
      .populate('carId', 'basicInfo pricing images status')
      .populate('buyerId', 'name email phone profile.avatar')
      .populate('sellerId', 'name email phone profile.avatar');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is participant
    if (chat.buyerId._id.toString() !== userId && chat.sellerId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get chat messages
// @route   GET /api/chats/:id/messages
// @access  Private
const getChatMessages = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.userId;
    const { page = 1, limit = 50 } = req.query;

    // Verify chat access
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.buyerId.toString() !== userId && chat.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      chatId,
      isDeleted: false
    })
      .populate('senderId', 'name profile.avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Message.countDocuments({ chatId, isDeleted: false });

    // Mark messages as read
    await Message.updateMany(
      {
        chatId,
        receiverId: userId,
        isRead: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    // Update unread count in chat
    const isBuyer = chat.buyerId.toString() === userId;
    if (isBuyer) {
      chat.unreadCount.buyerUnread = 0;
    } else {
      chat.unreadCount.sellerUnread = 0;
    }
    await chat.save();

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Send message
// @route   POST /api/chats/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const chatId = req.params.id;
    const senderId = req.user.userId;
    const { content, messageType = 'text', offer } = req.body;

    // Verify chat access
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (chat.buyerId.toString() !== senderId && chat.sellerId.toString() !== senderId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Determine receiver
    const receiverId = chat.buyerId.toString() === senderId 
      ? chat.sellerId 
      : chat.buyerId;

    // Create message
    const message = await Message.create({
      chatId,
      senderId,
      receiverId,
      content,
      messageType,
      offer
    });

    // Update chat
    chat.lastMessage = content.substring(0, 100);
    chat.lastMessageAt = new Date();
    
    // Increment unread count for receiver
    const isSenderBuyer = chat.buyerId.toString() === senderId;
    if (isSenderBuyer) {
      chat.unreadCount.sellerUnread += 1;
    } else {
      chat.unreadCount.buyerUnread += 1;
    }
    
    await chat.save();

    // Populate sender details
    await message.populate('senderId', 'name profile.avatar');

    res.status(201).json({
      success: true,
      data: { message }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/chats/:chatId/messages/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Archive chat
// @route   PUT /api/chats/:id/archive
// @access  Private
const archiveChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is participant
    if (chat.buyerId.toString() !== userId && chat.sellerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    chat.status = 'archived';
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Chat archived successfully'
    });

  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive chat',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getOrCreateChat,
  getUserChats,
  getChatById,
  getChatMessages,
  sendMessage,
  deleteMessage,
  archiveChat
};