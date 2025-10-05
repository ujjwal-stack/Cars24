// server/src/socket/chatHandlers.js
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

// Store active users
const activeUsers = new Map();

// Socket authentication middleware
const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

// Initialize chat socket handlers
const initializeChatHandlers = (io) => {
  // Use authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Add user to active users
    activeUsers.set(socket.userId, socket.id);

    // Emit online status
    socket.broadcast.emit('user:online', socket.userId);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join chat room
    socket.on('chat:join', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Verify user is participant
        if (chat.buyerId.toString() !== socket.userId && 
            chat.sellerId.toString() !== socket.userId) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.join(`chat:${chatId}`);
        socket.emit('chat:joined', { chatId });

        // Notify other user
        const otherUserId = chat.buyerId.toString() === socket.userId 
          ? chat.sellerId.toString() 
          : chat.buyerId.toString();
        
        io.to(`user:${otherUserId}`).emit('chat:participant-joined', {
          chatId,
          userId: socket.userId
        });

      } catch (error) {
        console.error('Join chat error:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave chat room
    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
      socket.emit('chat:left', { chatId });
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, messageType = 'text', offer } = data;

        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        // Verify user is participant
        if (chat.buyerId.toString() !== socket.userId && 
            chat.sellerId.toString() !== socket.userId) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Determine receiver
        const receiverId = chat.buyerId.toString() === socket.userId 
          ? chat.sellerId 
          : chat.buyerId;

        // Create message
        const message = await Message.create({
          chatId,
          senderId: socket.userId,
          receiverId,
          content,
          messageType,
          offer
        });

        // Update chat
        chat.lastMessage = content.substring(0, 100);
        chat.lastMessageAt = new Date();
        
        // Increment unread count for receiver
        const isSenderBuyer = chat.buyerId.toString() === socket.userId;
        if (isSenderBuyer) {
          chat.unreadCount.sellerUnread += 1;
        } else {
          chat.unreadCount.buyerUnread += 1;
        }
        
        await chat.save();

        // Populate sender details
        await message.populate('senderId', 'name profile.avatar');

        // Emit to chat room
        io.to(`chat:${chatId}`).emit('message:new', message);

        // Send notification to receiver
        io.to(`user:${receiverId}`).emit('notification:new-message', {
          chatId,
          message: message
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:user-typing', {
        userId: socket.userId,
        chatId
      });
    });

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:user-stopped', {
        userId: socket.userId,
        chatId
      });
    });

    // Mark messages as read
    socket.on('messages:read', async ({ chatId }) => {
      try {
        await Message.updateMany(
          {
            chatId,
            receiverId: socket.userId,
            isRead: false
          },
          {
            $set: { isRead: true, readAt: new Date() }
          }
        );

        // Update chat unread count
        const chat = await Chat.findById(chatId);
        if (chat) {
          const isBuyer = chat.buyerId.toString() === socket.userId;
          if (isBuyer) {
            chat.unreadCount.buyerUnread = 0;
          } else {
            chat.unreadCount.sellerUnread = 0;
          }
          await chat.save();

          // Notify sender
          const otherUserId = isBuyer ? chat.sellerId.toString() : chat.buyerId.toString();
          io.to(`user:${otherUserId}`).emit('messages:read-by-receiver', {
            chatId,
            userId: socket.userId
          });
        }

      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // Remove from active users
      activeUsers.delete(socket.userId);

      // Notify others
      socket.broadcast.emit('user:offline', socket.userId);
    });
  });
};

module.exports = {
  initializeChatHandlers,
  activeUsers
};