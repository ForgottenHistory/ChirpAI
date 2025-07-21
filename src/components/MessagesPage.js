import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';
import './MessagesPage.css';

const MessagesPage = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    initializeConversation();
  }, [characterId, currentUser]);

  const initializeConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get or create conversation
      const conversationResponse = await api.getOrCreateConversation(characterId);
      setConversation(conversationResponse.data);
      
      // Get messages
      const messagesResponse = await api.getMessages(conversationResponse.data.id);
      setMessages(messagesResponse.data);
      
    } catch (err) {
      console.error('Error initializing conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      const response = await api.sendMessage(conversation.id, newMessage.trim());
      
      // Add user message immediately
      const userMsg = response.data.userMessage;
      setMessages(prev => [...prev, userMsg]);
      
      // Add AI message if it exists
      if (response.data.aiMessage) {
        setMessages(prev => [...prev, response.data.aiMessage]);
      }
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="messages-page">
        <div className="messages-loading">Loading conversation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-page">
        <div className="messages-error">{error}</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="messages-page">
        <div className="messages-error">Conversation not found</div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      {/* Header */}
      <div className="messages-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
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

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
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
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender_type === 'user' ? 'message-sent' : 'message-received'}`}
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
                  <p>{message.content}</p>
                  <span className="message-time">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
    </div>
  );
};

export default MessagesPage;