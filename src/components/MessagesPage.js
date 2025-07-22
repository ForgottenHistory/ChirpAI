import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessageSwipe } from '../hooks/useMessageSwipe';
import { useMessageHandlers } from '../hooks/useMessageHandlers';
import { useTypingState } from '../hooks/useTypingState';
import TypingIndicator from './TypingIndicator';
import ConversationInbox from './ConversationInbox';
import MessageFloatingButtons from './MessageFloatingButtons';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import './MessagesPage.css';

const MessagesPage = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const messagesEndRef = useRef(null);
  const { subscribe, unsubscribe } = useWebSocket();

  // State management
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInbox, setShowInbox] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [cancelToken, setCancelToken] = useState(null);

  // Custom hooks
  const { isTyping, setIsTyping } = useTypingState();
  const {
    addMessageVariation,
    swipeToPrevious,
    swipeToNext,
    getCurrentContent,
    getSwipeInfo,
    clearMessageVariations
  } = useMessageSwipe();

  const {
    sending,
    generatingVariation,
    deleting,
    forcingResponse,
    handleSendMessage,
    handleMessageClick,
    handleSwipeLeft,
    handleSwipeRight,
    handleGenerateVariation,
    handleRegenerate,
    handleContinue,
    handleDelete,
    handleForceResponse,
    initializeMessageVariations
  } = useMessageHandlers({
    conversation,
    messages,
    setMessages,
    selectedMessageId,
    setSelectedMessageId,
    addMessageVariation,
    swipeToPrevious,
    swipeToNext,
    clearMessageVariations,
    refreshInbox: () => loadConversations(),
    currentUser
  });

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

  // Set up WebSocket listeners
  useEffect(() => {
    if (!conversation) return;

    const cleanup = setupWebSocketListeners();
    return cleanup;
  }, [conversation, subscribe, unsubscribe, addMessageVariation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      await loadConversations();

      if (characterId) {
        await loadConversation(characterId);
      }
    } catch (err) {
      console.error('Error initializing data:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const conversationsResponse = await api.getConversations();
      setConversations(conversationsResponse.data);
    } catch (err) {
      console.error('Error refreshing inbox:', err);
    }
  };

  const loadConversation = async (charId) => {
    try {
      const conversationResponse = await api.getOrCreateConversation(charId);
      setConversation(conversationResponse.data);

      const messagesResponse = await api.getMessages(conversationResponse.data.id);
      const fetchedMessages = messagesResponse.data;
      setMessages(fetchedMessages);

      initializeMessageVariations(fetchedMessages);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    }
  };

  const setupWebSocketListeners = () => {
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
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === payload.data.message.id);
          if (exists) return prev;

          const newMessage = payload.data.message;
          addMessageVariation(newMessage.id, newMessage.content, true);
          return [...prev, newMessage];
        });
        setIsTyping(false);
        console.log(`[DM] Received new message via WebSocket`);
      }
      loadConversations();
    };

    // Subscribe to WebSocket events
    subscribe('typingStart', handleTypingStart);
    subscribe('typingStop', handleTypingStop);
    subscribe('newDirectMessage', handleNewDirectMessage);

    // Cleanup function
    return () => {
      unsubscribe('typingStart', handleTypingStart);
      unsubscribe('typingStop', handleTypingStop);
      unsubscribe('newDirectMessage', handleNewDirectMessage);
    };
  };

  const handleConversationSelect = (selectedCharacterId) => {
    navigate(`/messages/${selectedCharacterId}`);
  };

  const handleSendMessageWithCancel = async (content) => {
    // Create cancel token
    const token = { cancelled: false };
    setCancelToken(token);
    
    try {
      await handleSendMessage(content);
    } finally {
      // Clear cancel token when done
      setCancelToken(null);
    }
  };

  const handleCancelResponse = async () => {
    console.log('[CANCEL] Cancel button clicked', { 
      cancelToken: !!cancelToken, 
      conversationId: conversation?.id,
      isTyping,
      sending 
    });
    
    if (cancelToken) {
      cancelToken.cancelled = true;
      setCancelToken(null);
    }
    
    setIsTyping(false);
    
    if (conversation?.id) {
      try {
        console.log('[CANCEL] Calling backend cancel API...');
        const response = await api.cancelAIResponse(conversation.id);
        console.log('[CANCEL] Backend response:', response.data);
      } catch (err) {
        console.error('[CANCEL] Error canceling AI response:', err);
      }
    }
  };

  // Get swipe info for selected message
  const selectedSwipeInfo = selectedMessageId ? getSwipeInfo(selectedMessageId) : {
    hasVariations: false,
    currentIndex: 0,
    totalVariations: 0,
    canSwipeLeft: false,
    canSwipeRight: false
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
              <MessagesList
                messages={messages}
                conversation={conversation}
                isTyping={isTyping}
                selectedMessageId={selectedMessageId}
                onMessageClick={handleMessageClick}
                getCurrentContent={getCurrentContent}
              />
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
              conversation={conversation}
              onSendMessage={handleSendMessageWithCancel}
              sending={sending || isTyping}
              onCancelResponse={handleCancelResponse}
            />
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

      {/* Message Floating Buttons */}
      <MessageFloatingButtons
        selectedMessageId={selectedMessageId}
        swipeInfo={selectedSwipeInfo}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onGenerateVariation={handleGenerateVariation}
        onRegenerate={handleRegenerate}
        onContinue={handleContinue}
        onDelete={handleDelete}
        onForceResponse={handleForceResponse}
        isGenerating={isTyping || sending || generatingVariation}
        generatingVariation={generatingVariation}
        deleting={deleting}
        forcingResponse={forcingResponse}
      />
    </div>
  );
};

export default MessagesPage;