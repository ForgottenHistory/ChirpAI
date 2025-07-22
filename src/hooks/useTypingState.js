// src/hooks/useTypingState.js
import { useState, useCallback } from 'react';

export const useTypingState = () => {
  const [isTyping, setIsTyping] = useState(false);

  const startTyping = useCallback(() => {
    setIsTyping(true);
  }, []);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
  }, []);

  const toggleTyping = useCallback(() => {
    setIsTyping(prev => !prev);
  }, []);

  return {
    isTyping,
    setIsTyping,
    startTyping,
    stopTyping,
    toggleTyping
  };
};