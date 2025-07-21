// src/hooks/useMessageSwipe.js
import { useState, useCallback } from 'react';

export const useMessageSwipe = () => {
  // Store message variations: { messageId: { variations: [...], currentIndex: 0 } }
  const [messageVariations, setMessageVariations] = useState({});

  // Add a new variation for a message
  const addMessageVariation = useCallback((messageId, content, isInitial = false) => {
    setMessageVariations(prev => {
      const existing = prev[messageId];
      
      if (isInitial || !existing) {
        // First variation for this message
        return {
          ...prev,
          [messageId]: {
            variations: [content],
            currentIndex: 0
          }
        };
      } else {
        // Add new variation
        const newVariations = [...existing.variations, content];
        return {
          ...prev,
          [messageId]: {
            variations: newVariations,
            currentIndex: newVariations.length - 1 // Show newest variation
          }
        };
      }
    });
  }, []);

  // Navigate to previous variation
  const swipeToPrevious = useCallback((messageId) => {
    setMessageVariations(prev => {
      const existing = prev[messageId];
      if (!existing || existing.currentIndex === 0) return prev;
      
      return {
        ...prev,
        [messageId]: {
          ...existing,
          currentIndex: existing.currentIndex - 1
        }
      };
    });
  }, []);

  // Navigate to next variation
  const swipeToNext = useCallback((messageId) => {
    setMessageVariations(prev => {
      const existing = prev[messageId];
      if (!existing || existing.currentIndex >= existing.variations.length - 1) return prev;
      
      return {
        ...prev,
        [messageId]: {
          ...existing,
          currentIndex: existing.currentIndex + 1
        }
      };
    });
  }, []);

  // Get current content for a message
  const getCurrentContent = useCallback((messageId, originalContent) => {
    const variations = messageVariations[messageId];
    if (!variations || variations.variations.length === 0) {
      return originalContent;
    }
    return variations.variations[variations.currentIndex];
  }, [messageVariations]);

  // Get swipe info for a message
  const getSwipeInfo = useCallback((messageId) => {
    const variations = messageVariations[messageId];
    if (!variations) {
      return {
        hasVariations: false,
        currentIndex: 0,
        totalVariations: 0,
        canSwipeLeft: false,
        canSwipeRight: false
      };
    }

    return {
      hasVariations: variations.variations.length > 1,
      currentIndex: variations.currentIndex,
      totalVariations: variations.variations.length,
      canSwipeLeft: variations.currentIndex > 0,
      canSwipeRight: variations.currentIndex < variations.variations.length - 1
    };
  }, [messageVariations]);

  // Clear all variations for a message (for regenerate)
  const clearMessageVariations = useCallback((messageId) => {
    setMessageVariations(prev => {
      const newState = { ...prev };
      delete newState[messageId];
      return newState;
    });
  }, []);

  return {
    addMessageVariation,
    swipeToPrevious,
    swipeToNext,
    getCurrentContent,
    getSwipeInfo,
    clearMessageVariations
  };
};