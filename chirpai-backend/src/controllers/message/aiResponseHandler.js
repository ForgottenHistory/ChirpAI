const { sendMessage } = require('../../services/messageService');
const { getCharacterById } = require('../../services/characterService');
const { generateDirectMessage, calculateTypingTime } = require('../../services/aiService');
const webSocketService = require('../../services/websocketService');
const typingIndicatorHandler = require('./typingIndicatorHandler');

// Store active AI response timeouts
const activeResponses = new Map();

// Handle AI response generation and sending
const handleAIResponse = async (conversationId, currentUser, userMessage, conversationHistory) => {
  let conversation = null;
  let character = null;
  
  try {
    // Get conversation details
    const getConversation = require('../../database/db').prepare('SELECT * FROM conversations WHERE id = ?');
    conversation = getConversation.get(conversationId);

    if (!conversation) {
      console.error('[AI_RESPONSE] Conversation not found:', conversationId);
      return;
    }

    // Get character info
    character = getCharacterById(conversation.character_id);
    if (!character) {
      console.error('[AI_RESPONSE] Character not found:', conversation.character_id);
      return;
    }

    // Mark this conversation as having an active response
    const responseData = {
      character,
      startTime: Date.now(),
      stage: 'starting'
    };
    activeResponses.set(conversationId, responseData);
    console.log(`[AI_RESPONSE] Started response for conversation ${conversationId}`);

    // Start typing sequence
    await typingIndicatorHandler.startTypingSequence(conversationId, character);
    
    // Check if cancelled during typing start
    if (!activeResponses.has(conversationId)) {
      console.log('[AI_RESPONSE] Cancelled during typing start');
      return;
    }
    
    responseData.stage = 'generating';

    // Generate AI response
    const aiResponse = await generateDirectMessage(
      conversation.character_id,
      currentUser.display_name,
      userMessage,
      conversationHistory
    );

    // Check if cancelled during generation
    if (!activeResponses.has(conversationId)) {
      console.log('[AI_RESPONSE] Cancelled during generation');
      typingIndicatorHandler.stopTyping(conversationId, character);
      return;
    }

    responseData.stage = 'typing_delay';
    responseData.aiResponse = aiResponse;

    // Calculate realistic typing time
    const typingDuration = calculateTypingTime(aiResponse);
    console.log(`[AI_RESPONSE] Generated response, will send after ${typingDuration}ms typing delay`);

    // Store the timeout so it can be cancelled
    const timeoutId = setTimeout(() => {
      // Double-check if response was cancelled
      const currentResponse = activeResponses.get(conversationId);
      if (!currentResponse) {
        console.log('[AI_RESPONSE] Response was cancelled during typing delay');
        return;
      }

      // Clean up our tracking
      activeResponses.delete(conversationId);

      // Stop typing indicator
      typingIndicatorHandler.stopTyping(conversationId, character);

      // Send AI response
      const aiMessage = sendMessage(
        conversationId,
        'character',
        conversation.character_id,
        aiResponse
      );

      // Broadcast the new message
      webSocketService.broadcastNewDirectMessage(aiMessage, conversation, character);

      console.log(`[AI_RESPONSE] ${character.name} responded: "${aiResponse}"`);

    }, typingDuration);

    // Store the timeout ID for potential cancellation
    responseData.timeoutId = timeoutId;

  } catch (error) {
    console.error('[AI_RESPONSE] Error generating AI response:', error);
    
    // Clean up on error
    activeResponses.delete(conversationId);
    
    // Make sure to stop typing indicator on error
    if (character) {
      typingIndicatorHandler.stopTyping(conversationId, character);
    } else if (conversation) {
      // Fallback: try to get character again
      const fallbackCharacter = getCharacterById(conversation.character_id);
      if (fallbackCharacter) {
        typingIndicatorHandler.stopTyping(conversationId, fallbackCharacter);
      }
    }
  }
};

// Cancel an active AI response
const cancelAIResponse = (conversationId) => {
  const activeResponse = activeResponses.get(conversationId);
  
  if (activeResponse) {
    console.log(`[AI_RESPONSE] Cancelling response in stage: ${activeResponse.stage}`);
    
    // Clear the timeout if it exists
    if (activeResponse.timeoutId) {
      clearTimeout(activeResponse.timeoutId);
    }
    
    // Stop typing indicator
    typingIndicatorHandler.stopTyping(conversationId, activeResponse.character);
    
    // Remove from tracking
    activeResponses.delete(conversationId);
    
    console.log(`[AI_RESPONSE] Successfully cancelled response for conversation ${conversationId}`);
    return true;
  }
  
  console.log(`[AI_RESPONSE] No active response found for conversation ${conversationId}`);
  return false;
};

// Get active response info (for debugging)
const getActiveResponses = () => {
  const responses = [];
  for (const [conversationId, data] of activeResponses.entries()) {
    responses.push({
      conversationId,
      character: data.character.name,
      startTime: data.startTime,
      stage: data.stage,
      duration: Date.now() - data.startTime
    });
  }
  return responses;
};

module.exports = {
  handleAIResponse,
  cancelAIResponse,
  getActiveResponses
};