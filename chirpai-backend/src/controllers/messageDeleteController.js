const messageDeleteService = require('../services/variations/messageDeleteService');
const { getCurrentUser } = require('../services/userService');

// Delete messages from a specific point onwards
const deleteMessagesFrom = (req, res) => {
  try {
    const { conversationId, messageId } = req.params;
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    if (!conversationId || !messageId) {
      return res.status(400).json({ error: 'Conversation ID and Message ID are required' });
    }

    // Delete messages from this point onwards
    const result = messageDeleteService.deleteMessagesFrom(
      parseInt(conversationId),
      parseInt(messageId),
      currentUser.id
    );

    console.log(`[DELETE] User ${currentUser.username} deleted ${result.deletedCount} messages from conversation ${conversationId}`);

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} messages`,
      ...result
    });

  } catch (error) {
    console.error('Error deleting messages from point:', error);
    res.status(500).json({ error: error.message || 'Failed to delete messages' });
  }
};

// Delete a single message (for future use)
const deleteSingleMessage = (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    if (!messageId) {
      return res.status(400).json({ error: 'Message ID is required' });
    }

    // Delete single message
    const result = messageDeleteService.deleteSingleMessage(
      parseInt(messageId),
      currentUser.id
    );

    console.log(`[DELETE] User ${currentUser.username} deleted message ${messageId}`);

    res.json({
      success: true,
      message: 'Message deleted',
      ...result
    });

  } catch (error) {
    console.error('Error deleting single message:', error);
    res.status(500).json({ error: error.message || 'Failed to delete message' });
  }
};

module.exports = {
  deleteMessagesFrom,
  deleteSingleMessage
};