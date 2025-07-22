const { sendMessage } = require('../../services/messageService');
const { getCharacterById } = require('../../services/characterService');
const { generateDirectMessage, calculateTypingTime } = require('../../services/aiService');
const webSocketService = require('../../services/websocketService');
const typingIndicatorHandler = require('./typingIndicatorHandler');

// Handle AI response generation and sending
const handleAIResponse = async (conversationId, currentUser, userMessage, conversationHistory) => {
  try {
    // Get conversation details
    const getConversation = require('../../database/db').prepare('SELECT * FROM conversations WHERE id = ?');
    const conversation = getConversation.get(conversationId);

    if (!conversation) {
      console.error('[AI_RESPONSE] Conversation not found:', conversationId);
      return;
    }

    // Get character info
    const character = getCharacterById(conversation.character_id);
    if (!character) {
      console.error('[AI_RESPONSE] Character not found:', conversation.character_id);
      return;
    }

    // Start typing sequence
    await typingIndicatorHandler.startTypingSequence(conversationId, character);

    // Generate AI response
    const aiResponse = await generateDirectMessage(
      conversation.character_id,
      currentUser.display_name,
      userMessage,
      conversationHistory
    );

    // Calculate realistic typing time
    const typingDuration = calculateTypingTime(aiResponse);

    // Show typing for the calculated duration
    setTimeout(() => {
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

  } catch (error) {
    console.error('[AI_RESPONSE] Error generating AI response:', error);
    
    // Make sure to stop typing indicator on error
    const character = getCharacterById(conversation?.character_id);
    if (character) {
      typingIndicatorHandler.stopTyping(conversationId, character);
    }
  }
};

module.exports = {
  handleAIResponse
};