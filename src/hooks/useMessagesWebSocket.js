import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useTypingState } from './useTypingState';

export const useMessagesWebSocket = ({ 
  conversation, 
  setMessages, 
  addMessageVariation, 
  loadConversations 
}) => {
  const { subscribe, unsubscribe } = useWebSocket();
  const { isTyping, setIsTyping } = useTypingState();

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
  }, [conversation, subscribe, unsubscribe, addMessageVariation, setMessages, loadConversations, setIsTyping]);

  return { isTyping, setIsTyping };
};