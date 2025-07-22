import React from 'react';
import ConversationInbox from './ConversationInbox';
import MessagesHeader from './MessagesHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';

const MessagesLayout = ({
  // State
  showInbox,
  conversations,
  conversation,
  messages,
  isTyping,
  selectedMessageId,
  currentUser,
  sending,
  
  // Handlers
  onConversationSelect,
  onNewConversation,
  onToggleInbox,
  onBackToFeed,
  onSendMessage,
  onCancelResponse,
  onMessageClick,
  getCurrentContent,
  
  // Refs
  messagesEndRef
}) => {
  return (
    <div className="messages-layout">
      {/* Inbox Sidebar */}
      <div className={`inbox-sidebar ${showInbox ? 'visible' : 'hidden'}`}>
        <ConversationInbox
          conversations={conversations}
          activeConversationId={conversation?.id}
          onConversationSelect={onConversationSelect}
          onNewConversation={onNewConversation}
          currentUser={currentUser}
        />
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {conversation ? (
          <>
            {/* Header */}
            <MessagesHeader
              conversation={conversation}
              onToggleInbox={onToggleInbox}
              onBackToFeed={onBackToFeed}
            />

            {/* Messages */}
            <div className="messages-container">
              <MessagesList
                messages={messages}
                conversation={conversation}
                isTyping={isTyping}
                selectedMessageId={selectedMessageId}
                onMessageClick={onMessageClick}
                getCurrentContent={getCurrentContent}
              />
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput
              conversation={conversation}
              onSendMessage={onSendMessage}
              sending={sending}
              onCancelResponse={onCancelResponse}
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
    </div>
  );
};

export default MessagesLayout;