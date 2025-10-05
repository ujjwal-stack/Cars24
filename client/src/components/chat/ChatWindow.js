// client/src/components/chat/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { chatService } from '../../services/chatService';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Loader } from '../common/Loader';

export const ChatWindow = ({ chatId, onClose }) => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const { socket, connected } = useSocket();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      loadChat();
      loadMessages();
      
      if (socket && connected) {
        joinChat();
      }
    }

    return () => {
      if (socket && connected && chatId) {
        socket.emit('chat:leave', chatId);
      }
    };
  }, [chatId, socket, connected]);

  useEffect(() => {
    if (socket && connected) {
      // Listen for new messages
      socket.on('message:new', handleNewMessage);
      
      // Listen for typing indicators
      socket.on('typing:user-typing', () => setTyping(true));
      socket.on('typing:user-stopped', () => setTyping(false));

      return () => {
        socket.off('message:new');
        socket.off('typing:user-typing');
        socket.off('typing:user-stopped');
      };
    }
  }, [socket, connected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = async () => {
    try {
      const result = await chatService.getChatById(chatId);
      setChat(result.data.chat);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const result = await chatService.getChatMessages(chatId);
      setMessages(result.data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinChat = () => {
    socket.emit('chat:join', chatId);
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
    
    // Mark as read if chat is open
    if (socket && connected) {
      socket.emit('messages:read', { chatId });
    }
  };

  const handleSendMessage = async (content, messageType = 'text') => {
    if (!socket || !connected) {
      console.error('Socket not connected');
      return;
    }

    socket.emit('message:send', {
      chatId,
      content,
      messageType
    });
  };

  const handleTyping = (isTyping) => {
    if (!socket || !connected) return;

    if (isTyping) {
      socket.emit('typing:start', { chatId });
    } else {
      socket.emit('typing:stop', { chatId });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <Loader text="Loading chat..." />;
  }

  if (!chat) {
    return <div className="chat-error">Chat not found</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-info">
          <img 
            src={chat.sellerId.profile?.avatar || '/default-avatar.png'} 
            alt="User"
            className="chat-avatar"
          />
          <div className="chat-header-text">
            <h3>{chat.sellerId.name}</h3>
            <p className="chat-car-info">
              {chat.carId.basicInfo.brand} {chat.carId.basicInfo.model}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="chat-close-btn">×</button>
      </div>

      <div className="chat-body">
        <MessageList messages={messages} />
        {typing && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default ChatWindow;