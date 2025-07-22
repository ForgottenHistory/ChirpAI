import React, { useEffect, useRef } from 'react';
import { useMessageSwipe } from '../hooks/useMessageSwipe';
import { useMessageHandlers } from '../hooks/useMessageHandlers';
import { useMessagesPageState } from '../hooks/useMessagesPageState';
import { useMessagesWebSocket } from '../hooks/useMessagesWebSocket';
import { useMessageCancel } from '../hooks/useMessageCancel';
import MessagesLayout from './MessagesLayout';
import MessageFloatingButtons from './MessageFloatingButtons';
import './MessagesPage.css';

const MessagesPage = () => {
  const messagesEndRef = useRef(null);

  // State management
  const {
    conversation,
    messages,
    conversations,
    loading,
    error,
    showInbox,
    selectedMessageId,
    cancelToken,
    currentUser,
    setMessages,
    setSelectedMessageId,
    setCancelToken,
    loadConversations,
    initializeData,
    handleConversationSelect,
    handleBackToFeed,
    handleNewConversation,
    toggleInbox
  } = useMessagesPageState();

  // Message swipe functionality
  const {
    addMessageVariation,
    swipeToPrevious,
    swipeToNext,
    getCurrentContent,
    getSwipeInfo,
    clearMessageVariations
  } = useMessageSwipe();

  // WebSocket handling
  const { isTyping, setIsTyping } = useMessagesWebSocket({
    conversation,
    setMessages,
    addMessageVariation,
    loadConversations
  });

  // Message handlers
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
    refreshInbox: loadConversations,
    currentUser
  });

  // Cancel functionality
  const {
    handleSendMessageWithCancel,
    handleCancelResponse
  } = useMessageCancel({
    cancelToken,
    setCancelToken,
    setIsTyping,
    conversation
  });

  // Effects
  useEffect(() => {
    document.body.classList.add('messages-page');
    return () => {
      document.body.classList.remove('messages-page');
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      handleBackToFeed();
      return;
    }
    initializeData();
  }, [currentUser]);

  useEffect(() => {
    if (messages.length > 0) {
      initializeMessageVariations(messages);
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Loading and error states
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

  // Get swipe info for selected message
  const selectedSwipeInfo = selectedMessageId ? getSwipeInfo(selectedMessageId) : {
    hasVariations: false,
    currentIndex: 0,
    totalVariations: 0,
    canSwipeLeft: false,
    canSwipeRight: false
  };

  // Handle send message with cancel support
  const handleSendWithCancel = (content) => {
    return handleSendMessageWithCancel(handleSendMessage, content);
  };

  return (
    <>
      <MessagesLayout
        showInbox={showInbox}
        conversations={conversations}
        conversation={conversation}
        messages={messages}
        isTyping={isTyping}
        selectedMessageId={selectedMessageId}
        currentUser={currentUser}
        sending={sending || isTyping}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
        onToggleInbox={toggleInbox}
        onBackToFeed={handleBackToFeed}
        onSendMessage={handleSendWithCancel}
        onCancelResponse={handleCancelResponse}
        onMessageClick={handleMessageClick}
        getCurrentContent={getCurrentContent}
        messagesEndRef={messagesEndRef}
      />

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
    </>
  );
};

export default MessagesPage;