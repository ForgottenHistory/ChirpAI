import React from 'react';
import './TypingIndicator.css';

const TypingIndicator = ({ character, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="typing-indicator">
      <img 
        src={character.avatar || '/avatars/avatar1.png'} 
        alt={character.name}
        className="typing-avatar"
        onError={(e) => {
          e.target.src = '/avatars/avatar1.png';
        }}
      />
      <div className="typing-bubble">
        <div className="typing-text">
          {character.name} is typing
        </div>
        <div className="typing-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;