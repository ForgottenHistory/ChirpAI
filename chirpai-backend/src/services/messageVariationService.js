const db = require('../database/db');
const { generateDirectMessage } = require('./aiService');
const { getCharacterById } = require('./characterService');

class MessageVariationService {
  constructor() {
    this.variations = new Map(); // messageId -> variations array
  }

  // Generate a new variation for a message
  async generateVariation(messageId, userId, characterId) {
    try {
      // Get the original message
      const getMessageStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
      const originalMessage = getMessageStmt.get(messageId);
      
      if (!originalMessage || originalMessage.sender_type !== 'character') {
        throw new Error('Message not found or not a character message');
      }

      // Get conversation to get context
      const getConversationStmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
      const conversation = getConversationStmt.get(originalMessage.conversation_id);
      
      if (!conversation || conversation.user_id !== userId) {
        throw new Error('Unauthorized or conversation not found');
      }

      // Get recent conversation history for context
      const getHistoryStmt = db.prepare(`
        SELECT * FROM messages 
        WHERE conversation_id = ? AND id < ?
        ORDER BY created_at DESC 
        LIMIT 10
      `);
      const history = getHistoryStmt.all(originalMessage.conversation_id, messageId);

      // Get character info
      const character = getCharacterById(characterId);
      if (!character) {
        throw new Error('Character not found');
      }

      // Get user info
      const { getUserById } = require('./userService');
      const user = getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Find the user message that the character was responding to
      const userMessage = history.find(msg => msg.sender_type === 'user');
      const userContent = userMessage ? userMessage.content : 'Hello';

      // Generate new variation
      const newVariation = await generateDirectMessage(
        characterId,
        user.display_name,
        userContent,
        history.reverse() // Reverse to get chronological order
      );

      // Store variation in memory (you could also store in DB if persistence is needed)
      const messageVariations = this.variations.get(messageId) || [originalMessage.content];
      messageVariations.push(newVariation);
      this.variations.set(messageId, messageVariations);

      console.log(`[VARIATION] Generated new variation for message ${messageId}: "${newVariation}"`);

      return {
        messageId,
        variation: newVariation,
        variationIndex: messageVariations.length - 1,
        totalVariations: messageVariations.length
      };

    } catch (error) {
      console.error(`[VARIATION] Error generating variation for message ${messageId}:`, error);
      throw error;
    }
  }

  // Get all variations for a message
  getVariations(messageId) {
    return this.variations.get(messageId) || [];
  }

  // Get specific variation by index
  getVariation(messageId, index) {
    const variations = this.variations.get(messageId) || [];
    return variations[index] || null;
  }

  // Clear all variations for a message (for regenerate)
  clearVariations(messageId) {
    this.variations.delete(messageId);
    console.log(`[VARIATION] Cleared all variations for message ${messageId}`);
  }

  // Initialize variations from original message
  initializeVariations(messageId, originalContent) {
    if (!this.variations.has(messageId)) {
      this.variations.set(messageId, [originalContent]);
    }
  }

  // Get variation count
  getVariationCount(messageId) {
    const variations = this.variations.get(messageId) || [];
    return variations.length;
  }

  // Regenerate all variations (clear and create new base)
  async regenerateMessage(messageId, userId, characterId) {
    try {
      // Clear existing variations
      this.clearVariations(messageId);
      
      // Generate a completely new response
      const result = await this.generateVariation(messageId, userId, characterId);
      
      // This will be the new "original" message
      console.log(`[VARIATION] Regenerated message ${messageId}`);
      return result;

    } catch (error) {
      console.error(`[VARIATION] Error regenerating message ${messageId}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const messageVariationService = new MessageVariationService();

module.exports = messageVariationService;