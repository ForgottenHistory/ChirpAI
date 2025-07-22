// src/components/MessageInput.js
import React, { useState } from 'react';

const MessageInput = ({ conversation, onSendMessage, sending }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      await onSendMessage(messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore the message text on error
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Message ${conversation.character.name}...`}
          className="message-input"
          disabled={sending}
          maxLength={500}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!newMessage.trim() || sending}
        >
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;