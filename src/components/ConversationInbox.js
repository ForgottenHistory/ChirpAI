import React from 'react';
import { formatRelativeTime } from '../utils/timeUtils';
import './ConversationInbox.css';

const ConversationInbox = ({ 
  conversations, 
  activeConversationId, 
  onConversationSelect, 
  onNewConversation,
  currentUser 
}) => {
  
  const formatLastMessage = (content, senderType, maxLength = 50) => {
    if (!content) return 'No messages yet';
    
    const prefix = senderType === 'user' ? 'You: ' : '';
    const message = `${prefix}${content}`;
    
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + '...';
  };

  const getLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return formatRelativeTime(timestamp);
  };

  const isConversationUnread = (conversation) => {
    // For now, we'll implement a simple unread logic
    // You could enhance this with actual unread tracking
    return false; // Placeholder for unread logic
  };

  return (
    <div className="conversation-inbox">
      <div className="inbox-header">
        <div className="inbox-title">
          <h2>Messages</h2>
          <span className="conversation-count">
            {conversations.length}
          </span>
        </div>
        <button 
          className="new-conversation-btn"
          onClick={onNewConversation}
          title="Start new conversation"
        >
          ✏️
        </button>
      </div>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <div className="no-conversations-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>Start a conversation by visiting someone's profile and clicking "Message"</p>
            <button 
              className="browse-profiles-btn"
              onClick={onNewConversation}
            >
              Browse Profiles
            </button>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${
                activeConversationId === conversation.id ? 'active' : ''
              } ${
                isConversationUnread(conversation) ? 'unread' : ''
              }`}
              onClick={() => onConversationSelect(conversation.character_id)}
            >
              <div className="conversation-avatar">
                <img
                  src={conversation.character_avatar || '/avatars/avatar1.png'}
                  alt={conversation.character_name}
                  onError={(e) => {
                    e.target.src = '/avatars/avatar1.png';
                  }}
                />
                {isConversationUnread(conversation) && (
                  <div className="unread-indicator"></div>
                )}
              </div>

              <div className="conversation-content">
                <div className="conversation-header">
                  <h3 className="character-name">
                    {conversation.character_name}
                  </h3>
                  <span className="last-message-time">
                    {getLastMessageTime(conversation.last_message_time)}
                  </span>
                </div>

                <div className="conversation-preview">
                  <p className="last-message">
                    {formatLastMessage(
                      conversation.last_message_content,
                      conversation.last_message_sender_type
                    )}
                  </p>
                  {isConversationUnread(conversation) && (
                    <div className="unread-badge">
                      <span className="unread-count">1</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="inbox-footer">
        <div className="user-info">
          <img
            src={currentUser?.avatar || '/avatars/avatar1.png'}
            alt={currentUser?.display_name}
            className="current-user-avatar"
            onError={(e) => {
              e.target.src = '/avatars/avatar1.png';
            }}
          />
          <div className="current-user-details">
            <span className="current-user-name">
              {currentUser?.display_name}
            </span>
            <span className="current-user-username">
              @{currentUser?.username}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationInbox;