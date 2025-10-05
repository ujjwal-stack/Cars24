// client/src/services/chatService.js
import api from './api';

class ChatService {
  // Create or get existing chat
  async getOrCreateChat(carId, sellerId) {
    const response = await api.post('/chats', { carId, sellerId });
    return response.data;
  }

  // Get all user chats
  async getUserChats() {
    const response = await api.get('/chats');
    return response.data;
  }

  // Get chat by ID
  async getChatById(chatId) {
    const response = await api.get(`/chats/${chatId}`);
    return response.data;
  }

  // Get chat messages
  async getChatMessages(chatId, page = 1, limit = 50) {
    const response = await api.get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Send message (HTTP fallback)
  async sendMessage(chatId, content, messageType = 'text') {
    const response = await api.post(`/chats/${chatId}/messages`, {
      content,
      messageType
    });
    return response.data;
  }

  // Delete message
  async deleteMessage(chatId, messageId) {
    const response = await api.delete(`/chats/${chatId}/messages/${messageId}`);
    return response.data;
  }

  // Archive chat
  async archiveChat(chatId) {
    const response = await api.put(`/chats/${chatId}/archive`);
    return response.data;
  }
}

export const chatService = new ChatService();
export default chatService;