// src/components/MessageInput.js
import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ conversation, onSendMessage, sending, onCancelResponse }) => {
  const [newMessage, setNewMessage] = useState('');
  const inputRef = useRef(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Re-focus when sending state changes back to false
  useEffect(() => {
    if (!sending) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [sending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    try {
      await onSendMessage(messageText);
      // Force focus after a small delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore the message text on error
      // Focus on error too
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCancelClick = () => {
    if (onCancelResponse) {
      onCancelResponse();
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Message ${conversation.character.name}...`}
          className="message-input"
          disabled={sending}
          maxLength={500}
          autoFocus
        />
        {sending ? (
          <button
            type="button"
            className="send-btn cancel-btn"
            onClick={handleCancelClick}
          >
            Cancel
          </button>
        ) : (
          <button
            type="submit"
            className="send-btn"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        )}
      </form>
    </div>
  );
};

export default MessageInput;