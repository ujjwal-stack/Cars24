// client/src/components/chat/MessageList.js
import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const MessageList = ({ messages }) => {
  const { user } = useAuth();

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="message-list">
      {messages.map((message) => {
        const isSent = message.senderId._id === user?._id;
        
        return (
          <div 
            key={message._id} 
            className={`message ${isSent ? 'message-sent' : 'message-received'}`}
          >
            {!isSent && (
              <img 
                src={message.senderId.profile?.avatar || '/default-avatar.png'}
                alt="User"
                className="message-avatar"
              />
            )}
            
            <div className="message-content">
              {message.messageType === 'offer' && (
                <div className="message-offer">
                  <div className="offer-label">Price Offer</div>
                  <div className="offer-amount">
                    ₹{message.offer.price.toLocaleString('en-IN')}
                  </div>
                  {message.offer.status === 'pending' && !isSent && (
                    <div className="offer-actions">
                      <button className="btn btn-small btn-primary">Accept</button>
                      <button className="btn btn-small btn-outline">Counter</button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="message-text">{message.content}</div>
              
              <div className="message-meta">
                <span className="message-time">{formatTime(message.createdAt)}</span>
                {isSent && (
                  <span className="message-status">
                    {message.isRead ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;