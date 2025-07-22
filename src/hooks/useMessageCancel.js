import { api } from '../services/api';

export const useMessageCancel = ({ 
  cancelToken, 
  setCancelToken, 
  setIsTyping, 
  conversation 
}) => {
  
  const handleSendMessageWithCancel = async (handleSendMessage, content) => {
    // Create cancel token
    const token = { cancelled: false };
    setCancelToken(token);
    
    console.log('[SEND] Creating cancel token and sending message');
    
    try {
      await handleSendMessage(content, token);
    } finally {
      // Clear cancel token when done
      console.log('[SEND] Clearing cancel token');
      setCancelToken(null);
    }
  };

  const handleCancelResponse = async () => {
    console.log('[CANCEL] Cancel button clicked', { 
      cancelToken: !!cancelToken, 
      conversationId: conversation?.id,
      sending: !!cancelToken 
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

  return {
    handleSendMessageWithCancel,
    handleCancelResponse
  };
};