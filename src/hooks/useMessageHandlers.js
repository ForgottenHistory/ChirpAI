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

  const initializeMessageVariations = (fetchedMessages) => {
    fetchedMessages.forEach(message => {
      if (message.sender_type === 'character') {
        addMessageVariation(message.id, message.content, true);
      }
    });
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
      console.log('[VARIATION] Generating test variation for message:', selectedMessageId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate a simple test variation
      const testVariations = [
        "That's an interesting perspective! I'd love to hear more about your thoughts on this.",
        "I appreciate you sharing that with me. What made you think about this topic?",
        "That's fascinating! I've been thinking about similar things lately.",
        "Thanks for bringing this up - it's given me a lot to think about.",
        "I find your viewpoint really compelling. How did you come to this conclusion?"
      ];

      const randomVariation = testVariations[Math.floor(Math.random() * testVariations.length)];

      // Add the new variation to our swipe system
      addMessageVariation(selectedMessageId, randomVariation);
      console.log('[VARIATION] Added test variation:', randomVariation);

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
      // Clear existing variations
      clearMessageVariations(selectedMessageId);
      
      // TODO: Implement actual regeneration with API call
      console.log('Regenerate message:', selectedMessageId);
      alert('Regenerate feature coming next!');
    } catch (error) {
      console.error('Error regenerating message:', error);
      throw new Error('Failed to regenerate message');
    }
  };

  const handleContinue = async () => {
    if (!selectedMessageId) return;

    try {
      // TODO: Implement continue functionality
      console.log('Continue message:', selectedMessageId);
      alert('Continue feature coming next!');
    } catch (error) {
      console.error('Error continuing message:', error);
      throw new Error('Failed to continue message');
    }
  };

  return {
    sending,
    generatingVariation,
    handleSendMessage,
    handleMessageClick,
    handleSwipeLeft,
    handleSwipeRight,
    handleGenerateVariation,
    handleRegenerate,
    handleContinue,
    initializeMessageVariations
  };
};