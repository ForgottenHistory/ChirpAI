const {
  getConversationMessages,
  sendMessage
} = require('../services/messageService');
const { getCurrentUser } = require('../services/userService');
const aiResponseHandler = require('./message/aiResponseHandler');

// Force AI to send a response
const forceAIResponse = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    // Verify conversation exists and user has access
    const db = require('../database/db');
    const getConversationStmt = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?');
    const conversation = getConversationStmt.get(parseInt(conversationId), currentUser.id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found or access denied' });
    }

    console.log(`[FORCE_RESPONSE] User ${currentUser.username} forcing response in conversation ${conversationId}`);

    // Get recent conversation history
    const conversationHistory = getConversationMessages(parseInt(conversationId), 20);

    // Find the most recent user message to use as context
    const recentUserMessages = conversationHistory.filter(msg => msg.sender_type === 'user');
    const lastUserMessage = recentUserMessages[recentUserMessages.length - 1];
    
    // Use the last user message or a default prompt
    const userContent = lastUserMessage ? lastUserMessage.content : 'Hey, what\'s up?';

    console.log(`[FORCE_RESPONSE] Using context message: "${userContent}"`);

    // Trigger AI response using existing flow (don't wait for it)
    aiResponseHandler.handleAIResponse(
      parseInt(conversationId),
      currentUser,
      userContent,
      conversationHistory
    );

    // Return immediately
    res.json({
      success: true,
      message: 'AI response triggered',
      conversationId: parseInt(conversationId)
    });

  } catch (error) {
    console.error('Error forcing AI response:', error);
    res.status(500).json({ error: error.message || 'Failed to force AI response' });
  }
};

module.exports = {
  forceAIResponse
};