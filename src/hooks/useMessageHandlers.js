// src/hooks/useMessageHandlers.js
import { useState } from 'react';
import { api } from '../services/api';

export const useMessageHandlers = ({
  conversation,
  messages,
  setMessages,
  selectedMessageId,
  setSelectedMessageId,
  addMessageVariation,
  swipeToPrevious,
  swipeToNext,
  clearMessageVariations,
  refreshInbox,
  currentUser
}) => {
  const [sending, setSending] = useState(false);
  const [generatingVariation, setGeneratingVariation] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initializeMessageVariations = async (fetchedMessages) => {
    // Load variations for each character message
    for (const message of fetchedMessages) {
      if (message.sender_type === 'character') {
        try {
          // Load existing variations from backend
          const response = await api.getMessageVariations(message.id);
          const { variationContents } = response.data;
          
          if (variationContents && variationContents.length > 0) {
            // Initialize with all stored variations
            variationContents.forEach((content, index) => {
              addMessageVariation(message.id, content, index === 0);
            });
            console.log(`[VARIATION] Loaded ${variationContents.length} variations for message ${message.id}`);
          } else {
            // Fallback: Initialize with original content only
            addMessageVariation(message.id, message.content, true);
          }
        } catch (error) {
          console.error(`Error loading variations for message ${message.id}:`, error);
          // Fallback: Initialize with original content
          addMessageVariation(message.id, message.content, true);
        }
      }
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim() || sending || !conversation) return;

    setSending(true);

    try {
      const response = await api.sendMessage(conversation.id, content);

      // Add the user message from the response
      if (response.data.userMessage) {
        setMessages(prev => [...prev, response.data.userMessage]);
      }

      // Refresh inbox to update last message
      refreshInbox();

    } catch (err) {
      console.error('Error sending message:', err);
      throw new Error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMessageClick = (messageId, senderType) => {
    if (senderType === 'character') {
      setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
    } else {
      setSelectedMessageId(null); // Don't allow selecting user messages
    }
  };

  const handleSwipeLeft = () => {
    if (selectedMessageId) {
      swipeToPrevious(selectedMessageId);
    }
  };

  const handleSwipeRight = () => {
    if (selectedMessageId) {
      swipeToNext(selectedMessageId);
    }
  };

  const handleGenerateVariation = async () => {
    if (!selectedMessageId || generatingVariation) return;

    setGeneratingVariation(true);

    try {
      console.log('[VARIATION] Generating variation for message:', selectedMessageId);

      // Call backend API to generate variation
      const response = await api.generateMessageVariation(selectedMessageId);
      const { variation } = response.data;

      console.log('[VARIATION] Generated variation:', variation);

      // Add the new variation to our swipe system
      addMessageVariation(selectedMessageId, variation);

      // Auto-swipe to the new variation
      setTimeout(() => {
        // Swipe to the newest variation
        let attempts = 0;
        const maxAttempts = 10;
        
        const swipeToNewest = () => {
          if (attempts >= maxAttempts) return;
          attempts++;
          
          try {
            swipeToNext(selectedMessageId);
            // Try again after a short delay if needed
            setTimeout(swipeToNewest, 50);
          } catch (error) {
            // Stop trying if we hit an error
            console.log('Reached newest variation');
          }
        };
        
        swipeToNewest();
      }, 100);

    } catch (error) {
      console.error('Error generating variation:', error);
      throw new Error(`Failed to generate variation: ${error.message}`);
    } finally {
      setGeneratingVariation(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedMessageId) return;

    try {
      console.log('[REGENERATE] Regenerating message:', selectedMessageId);

      // Clear existing variations first
      clearMessageVariations(selectedMessageId);
      
      // Call backend API to regenerate message
      const response = await api.regenerateMessage(selectedMessageId);
      const { variation } = response.data;

      console.log('[REGENERATE] Regenerated message:', variation);

      // Add the regenerated message as the first (and only) variation
      addMessageVariation(selectedMessageId, variation, true);
      
    } catch (error) {
      console.error('Error regenerating message:', error);
      throw new Error('Failed to regenerate message');
    }
  };

  const handleContinue = async () => {
    if (!selectedMessageId) return;

    try {
      // For continue functionality, we could extend the current message
      // This could be implemented as a special type of variation
      console.log('Continue message:', selectedMessageId);
      
      // For now, show placeholder
      alert('Continue feature: This would extend the current message with additional content');
      
      // Future implementation could call something like:
      // const response = await api.continueMessage(selectedMessageId);
      
    } catch (error) {
      console.error('Error continuing message:', error);
      throw new Error('Failed to continue message');
    }
  };

  const handleDelete = async () => {
    if (!selectedMessageId || deleting) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete this message and everything after it? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setDeleting(true);

    try {
      console.log('[DELETE] Deleting from message:', selectedMessageId);

      // Call backend API to delete message and everything after it
      const response = await api.deleteMessagesFrom(conversation.id, selectedMessageId);
      const { deletedCount } = response.data;

      console.log(`[DELETE] Deleted ${deletedCount} messages from conversation`);

      // Remove deleted messages from local state
      setMessages(prev => {
        const selectedIndex = prev.findIndex(msg => msg.id === selectedMessageId);
        if (selectedIndex === -1) return prev;
        
        // Keep only messages before the selected one
        return prev.slice(0, selectedIndex);
      });

      // Clear selection
      setSelectedMessageId(null);

      // Refresh inbox to update last message
      refreshInbox();
      
    } catch (error) {
      console.error('Error deleting messages:', error);
      throw new Error('Failed to delete messages');
    } finally {
      setDeleting(false);
    }
  };

  return {
    sending,
    generatingVariation,
    deleting,
    handleSendMessage,
    handleMessageClick,
    handleSwipeLeft,
    handleSwipeRight,
    handleGenerateVariation,
    handleRegenerate,
    handleContinue,
    handleDelete,
    initializeMessageVariations
  };
};