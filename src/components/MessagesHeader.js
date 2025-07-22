import React from 'react';

const MessagesHeader = ({ conversation, onToggleInbox, onBackToFeed }) => {
  return (
    <div className="messages-header">
      <div className="header-left">
        <button
          className="inbox-toggle"
          onClick={onToggleInbox}
        >
          ☰
        </button>
        <button className="back-btn" onClick={onBackToFeed}>
          ← Back
        </button>
      </div>
      <div className="conversation-info">
        <img
          src={conversation.character.avatar || '/avatars/avatar1.png'}
          alt={conversation.character.name}
          className="header-avatar"
          onError={(e) => {
            e.target.src = '/avatars/avatar1.png';
          }}
        />
        <div className="header-details">
          <h2>{conversation.character.name}</h2>
          <span>@{conversation.character.username}</span>
        </div>
      </div>
    </div>
  );
};

export default MessagesHeader;