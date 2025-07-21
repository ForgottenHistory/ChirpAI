import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';
import './MessagesPage.css';

const MessagesPage = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const messagesEndRef = useRef(null);
  
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    initializeConversation();
  }, [characterId, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    
    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately
    setSending(true);
    
    // Create a temporary user message to show immediately
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_type: 'user',
      sender_id: currentUser.id,
      content: messageText,
      created_at: new Date().toISOString()
    };
    
    // Add user message immediately
    setMessages(prev => [...prev, tempUserMessage]);
    
    try {
      const response = await api.sendMessage(conversation.id, messageText);
      
      // Replace temp message with real user message and add AI response
      setMessages(prev => {
        // Remove the temp message and add the real messages
        const withoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id);
        const newMessages = [...withoutTemp, response.data.userMessage];
        
        // Add AI message if it exists
        if (response.data.aiMessage) {
          newMessages.push(response.data.aiMessage);
        }
        
        return newMessages;
      });
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      
      // Remove the temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
      setNewMessage(messageText); // Restore the message text
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
            <div ref={messagesEndRef} />
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