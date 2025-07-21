import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useWebSocket } from '../hooks/useWebSocket';
import TypingIndicator from './TypingIndicator';
import ConversationInbox from './ConversationInbox';
import './MessagesPage.css';

const MessagesPage = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const messagesEndRef = useRef(null);
  const { subscribe, unsubscribe } = useWebSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showInbox, setShowInbox] = useState(true);

  // Auto-scroll to bottom when messages change or typing status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Add messages-page class for styling adjustments
  useEffect(() => {
    document.body.classList.add('messages-page');
    return () => {
      document.body.classList.remove('messages-page');
    };
  }, []);

  // Check if user is logged in, if not redirect to home
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    initializeData();
  }, [characterId, currentUser]);

  // Set up WebSocket listeners for typing indicators and new messages
  useEffect(() => {
    if (!conversation) return;

    const handleTypingStart = (payload) => {
      if (payload.data.conversationId === conversation.id) {
        setIsTyping(true);
        console.log(`[TYPING] ${payload.data.characterName} started typing`);
      }
    };

    const handleTypingStop = (payload) => {
      if (payload.data.conversationId === conversation.id) {
        setIsTyping(false);
        console.log(`[TYPING] ${payload.data.characterName} stopped typing`);
      }
    };

    const handleNewDirectMessage = (payload) => {
      if (payload.data.conversationId === conversation.id) {
        // Add the AI message
        setMessages(prev => {
          // Check if message already exists (avoid duplicates)
          const exists = prev.some(msg => msg.id === payload.data.message.id);
          if (exists) {
            return prev;
          }
          return [...prev, payload.data.message];
        });
        setIsTyping(false); // Ensure typing stops when message arrives
        console.log(`[DM] Received new message via WebSocket`);
      }

      // Update inbox with new message
      refreshInbox();
    };

    // Subscribe to WebSocket events
    subscribe('typingStart', handleTypingStart);
    subscribe('typingStop', handleTypingStop);
    subscribe('newDirectMessage', handleNewDirectMessage);

    // Cleanup
    return () => {
      unsubscribe('typingStart', handleTypingStart);
      unsubscribe('typingStop', handleTypingStop);
      unsubscribe('newDirectMessage', handleNewDirectMessage);
    };
  }, [conversation, subscribe, unsubscribe]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load conversations list first
      await refreshInbox();

      if (characterId) {
        // Get or create conversation
        const conversationResponse = await api.getOrCreateConversation(characterId);
        setConversation(conversationResponse.data);

        // Get messages
        const messagesResponse = await api.getMessages(conversationResponse.data.id);
        setMessages(messagesResponse.data);
      }

    } catch (err) {
      console.error('Error initializing data:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const refreshInbox = async () => {
    try {
      const conversationsResponse = await api.getConversations();
      setConversations(conversationsResponse.data);
    } catch (err) {
      console.error('Error refreshing inbox:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately
    setSending(true);

    try {
      const response = await api.sendMessage(conversation.id, messageText);

      // Add the user message from the response
      if (response.data.userMessage) {
        setMessages(prev => [...prev, response.data.userMessage]);
      }

      // Refresh inbox to update last message
      refreshInbox();

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setNewMessage(messageText); // Restore the message text on error
    } finally {
      setSending(false);
    }
  };

  const handleConversationSelect = (selectedCharacterId) => {
    navigate(`/messages/${selectedCharacterId}`);
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
      <div className="messages-layout">
        <div className="messages-loading">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-layout">
        <div className="messages-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="messages-layout">
      {/* Inbox Sidebar */}
      <div className={`inbox-sidebar ${showInbox ? 'visible' : 'hidden'}`}>
        <ConversationInbox
          conversations={conversations}
          activeConversationId={conversation?.id}
          onConversationSelect={handleConversationSelect}
          onNewConversation={() => navigate('/')}
          currentUser={currentUser}
        />
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {conversation ? (
          <>
            {/* Header */}
            <div className="messages-header">
              <div className="header-left">
                <button
                  className="inbox-toggle"
                  onClick={() => setShowInbox(!showInbox)}
                >
                  ☰
                </button>
                <button className="back-btn" onClick={() => navigate('/')}>
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

            {/* Messages */}
            <div className="messages-container">
              {messages.length === 0 && !isTyping ? (
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

                  {/* Typing Indicator */}
                  <TypingIndicator
                    character={conversation.character}
                    isVisible={isTyping}
                  />

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
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="no-conversation-content">
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the inbox to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;