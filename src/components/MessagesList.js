// src/components/MessagesList.js
import React from 'react';
import TypingIndicator from './TypingIndicator';

const MessagesList = ({
  messages,
  conversation,
  isTyping,
  selectedMessageId,
  onMessageClick,
  getCurrentContent
}) => {
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="no-messages">
        <div className="no-messages-avatar">
          <img
            src={conversation.character.avatar || '/avatars/avatar1.png'}
            alt={conversation.character.name}
            onError={(e) => {
              e.target.src = '/avatars/avatar1.png';
            }}
          />
        </div>
        <h3>Start a conversation with {conversation.character.name}</h3>
        <p>Send a message to get the conversation started!</p>
      </div>
    );
  }

  return (
    <div className="messages-list">
      {messages.map((message) => {
        const isSelected = selectedMessageId === message.id;
        const displayContent = message.sender_type === 'character'
          ? getCurrentContent(message.id, message.content)
          : message.content;

        return (
          <div
            key={message.id}
            className={`message ${message.sender_type === 'user' ? 'message-sent' : 'message-received'} ${isSelected ? 'message-selected' : ''}`}
            onClick={() => onMessageClick(message.id, message.sender_type)}
          >
            {message.sender_type === 'character' && (
              <img
                src={conversation.character.avatar || '/avatars/avatar1.png'}
                alt={conversation.character.name}
                className="message-avatar"
                onError={(e) => {
                  e.target.src = '/avatars/avatar1.png';
                }}
              />
            )}
            <div className="message-content">
              <p>{displayContent}</p>
              <span className="message-time">
                {formatMessageTime(message.created_at)}
              </span>
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      <TypingIndicator
        character={conversation.character}
        isVisible={isTyping}
      />
    </div>
  );
};

export default MessagesList;