
// server/src/routes/chat.js
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getOrCreateChat,
  getUserChats,
  getChatById,
  getChatMessages,
  sendMessage,
  deleteMessage,
  archiveChat
} = require('../controllers/chatController');

const router = express.Router();

// All chat routes require authentication
router.use(protect);

router.post('/', getOrCreateChat);
router.get('/', getUserChats);
router.get('/:id', getChatById);
router.get('/:id/messages', getChatMessages);
router.post('/:id/messages', sendMessage);
router.delete('/:chatId/messages/:messageId', deleteMessage);
router.put('/:id/archive', archiveChat);

module.exports = router;