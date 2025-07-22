const db = require('../../database/db');
const { getCharacterById } = require('../characterService');

class VariationContextService {
  // Validate message and get context data
  async getMessageContext(messageId, userId) {
    // Get the original message
    const getMessageStmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    const originalMessage = getMessageStmt.get(messageId);
    
    if (!originalMessage || originalMessage.sender_type !== 'character') {
      throw new Error('Message not found or not a character message');
    }

    // Get conversation to verify authorization
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

    return {
      originalMessage,
      conversation,
      history: history.reverse() // Return in chronological order
    };
  }

  // Get character and user info
  async getParticipants(characterId, userId) {
    // Get character info
    const character = getCharacterById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get user info
    const { getUserById } = require('../userService');
    const user = getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return { character, user };
  }

  // Extract user message that prompted the character response
  getUserPrompt(history) {
    const userMessage = history.find(msg => msg.sender_type === 'user');
    return userMessage ? userMessage.content : 'Hello';
  }

  // Validate message permissions
  validateMessagePermissions(messageId, userId, senderType = 'character') {
    if (senderType !== 'character') {
      throw new Error('Can only generate variations for character messages');
    }

    // Get message with conversation info in one query
    const stmt = db.prepare(`
      SELECT m.*, c.character_id, c.user_id as conversation_user_id
      FROM messages m 
      JOIN conversations c ON m.conversation_id = c.id 
      WHERE m.id = ?
    `);
    
    const message = stmt.get(messageId);
    
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender_type !== senderType) {
      throw new Error(`Can only process ${senderType} messages`);
    }

    if (message.conversation_user_id !== userId) {
      throw new Error('Unauthorized access to this conversation');
    }

    return message;
  }
}

module.exports = new VariationContextService();