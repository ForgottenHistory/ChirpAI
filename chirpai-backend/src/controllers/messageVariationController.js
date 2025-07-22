const messageVariationService = require('../services/messageVariationService');
const { getCurrentUser } = require('../services/userService');

// Generate a new variation for a message
const generateMessageVariation = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    // Get message to find character ID
    const db = require('../database/db');
    const getMessageStmt = db.prepare(`
      SELECT m.*, c.character_id 
      FROM messages m 
      JOIN conversations c ON m.conversation_id = c.id 
      WHERE m.id = ?
    `);
    const message = getMessageStmt.get(parseInt(messageId));

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender_type !== 'character') {
      return res.status(400).json({ error: 'Can only generate variations for character messages' });
    }

    // Generate variation
    const result = await messageVariationService.generateVariation(
      parseInt(messageId),
      currentUser.id,
      message.character_id
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error generating message variation:', error);
    res.status(500).json({ error: error.message || 'Failed to generate variation' });
  }
};

// Get all variations for a message
const getMessageVariations = (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    const variations = messageVariationService.getVariations(parseInt(messageId));
    const count = messageVariationService.getVariationCount(parseInt(messageId));

    res.json({
      messageId: parseInt(messageId),
      variations,
      count
    });

  } catch (error) {
    console.error('Error getting message variations:', error);
    res.status(500).json({ error: 'Failed to get variations' });
  }
};

// Regenerate message (clear all variations and create new)
const regenerateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    // Get message to find character ID
    const db = require('../database/db');
    const getMessageStmt = db.prepare(`
      SELECT m.*, c.character_id 
      FROM messages m 
      JOIN conversations c ON m.conversation_id = c.id 
      WHERE m.id = ?
    `);
    const message = getMessageStmt.get(parseInt(messageId));

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender_type !== 'character') {
      return res.status(400).json({ error: 'Can only regenerate character messages' });
    }

    // Regenerate message
    const result = await messageVariationService.regenerateMessage(
      parseInt(messageId),
      currentUser.id,
      message.character_id
    );

    res.json({
      success: true,
      message: 'Message regenerated',
      ...result
    });

  } catch (error) {
    console.error('Error regenerating message:', error);
    res.status(500).json({ error: error.message || 'Failed to regenerate message' });
  }
};

module.exports = {
  generateMessageVariation,
  getMessageVariations,
  regenerateMessage
};