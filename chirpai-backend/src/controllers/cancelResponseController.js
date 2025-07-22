const { getCurrentUser } = require('../services/userService');
const aiResponseHandler = require('./message/aiResponseHandler');

// Cancel an active AI response
const cancelAIResponse = (req, res) => {
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

    // Cancel the active response
    const cancelled = aiResponseHandler.cancelAIResponse(parseInt(conversationId));

    if (cancelled) {
      console.log(`[CANCEL] User ${currentUser.username} cancelled AI response in conversation ${conversationId}`);
      res.json({
        success: true,
        message: 'AI response cancelled',
        conversationId: parseInt(conversationId)
      });
    } else {
      res.json({
        success: false,
        message: 'No active response to cancel',
        conversationId: parseInt(conversationId)
      });
    }

  } catch (error) {
    console.error('Error cancelling AI response:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel AI response' });
  }
};

// Debug endpoint to see active responses
const getActiveResponses = (req, res) => {
  try {
    const activeResponses = aiResponseHandler.getActiveResponses();
    res.json({
      count: activeResponses.length,
      responses: activeResponses
    });
  } catch (error) {
    console.error('Error getting active responses:', error);
    res.status(500).json({ error: 'Failed to get active responses' });
  }
};

module.exports = {
  cancelAIResponse,
  getActiveResponses
};