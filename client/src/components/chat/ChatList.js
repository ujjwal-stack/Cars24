// client/src/components/chat/ChatList.js
export const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setLoading(true);
    try {
      const result = await chatService.getUserChats();
      setChats(result.data.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  if (loading) {
    return <Loader text="Loading chats..." />;
  }

  if (chats.length === 0) {
    return (
      <div className="no-chats">
        <p>No conversations yet</p>
        <p className="no-chats-subtitle">Start browsing cars to connect with sellers</p>
      </div>
    );
  }

  return (
    <div className="chat-list">
      {chats.map((chat) => (
        <div 
          key={chat._id} 
          className="chat-list-item"
          onClick={() => onSelectChat(chat._id)}
        >
          <img 
            src={chat.sellerId.profile?.avatar || '/default-avatar.png'}
            alt="User"
            className="chat-list-avatar"
          />
          
          <div className="chat-list-content">
            <div className="chat-list-header">
              <h4>{chat.sellerId.name}</h4>
              <span className="chat-list-time">
                {formatLastMessageTime(chat.lastMessageAt)}
              </span>
            </div>
            
            <div className="chat-list-details">
              <p className="chat-list-car">
                {chat.carId.basicInfo.brand} {chat.carId.basicInfo.model}
              </p>
              <p className="chat-list-message">
                {chat.lastMessage || 'No messages yet'}
              </p>
            </div>
          </div>

          {chat.unreadCount > 0 && (
            <div className="chat-unread-badge">{chat.unreadCount}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatList;