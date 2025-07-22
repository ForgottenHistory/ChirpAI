const db = require('../../database/db');
const variationDatabaseService = require('./variationDatabaseService');

class MessageDeleteService {
  // Delete a message and all messages after it in the conversation
  deleteMessagesFrom(conversationId, fromMessageId, userId) {
    try {
      // Verify user owns the conversation
      const conversation = this.validateConversationOwnership(conversationId, userId);
      
      // Get the message to delete to find its timestamp
      const messageToDelete = this.getMessageById(fromMessageId);
      if (!messageToDelete || messageToDelete.conversation_id !== conversationId) {
        throw new Error('Message not found in this conversation');
      }

      // Get all messages from this point onwards
      const messagesToDelete = this.getMessagesFromPoint(conversationId, messageToDelete.created_at);
      
      if (messagesToDelete.length === 0) {
        throw new Error('No messages found to delete');
      }

      console.log(`[DELETE] Found ${messagesToDelete.length} messages to delete from conversation ${conversationId}`);

      // Start a transaction for atomic deletion
      const deleteTransaction = db.transaction(() => {
        // Delete all message variations for these messages
        messagesToDelete.forEach(message => {
          const variationCount = variationDatabaseService.clearVariations(message.id);
          if (variationCount > 0) {
            console.log(`[DELETE] Cleared ${variationCount} variations for message ${message.id}`);
          }
        });

        // Delete the messages themselves
        const deleteMessagesStmt = db.prepare(`
          DELETE FROM messages 
          WHERE conversation_id = ? AND created_at >= ?
        `);
        
        const result = deleteMessagesStmt.run(conversationId, messageToDelete.created_at);

        // Update conversation's last_message_at to the most recent remaining message
        this.updateConversationLastMessage(conversationId);

        return result.changes;
      });

      const deletedCount = deleteTransaction();

      console.log(`[DELETE] Successfully deleted ${deletedCount} messages from conversation ${conversationId}`);

      return {
        deletedCount,
        deletedMessageIds: messagesToDelete.map(m => m.id),
        conversationId
      };

    } catch (error) {
      console.error(`[DELETE] Error deleting messages from conversation ${conversationId}:`, error);
      throw error;
    }
  }

  // Validate that the user owns the conversation
  validateConversationOwnership(conversationId, userId) {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?');
    const conversation = stmt.get(conversationId, userId);
    
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }
    
    return conversation;
  }

  // Get message by ID
  getMessageById(messageId) {
    const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
    return stmt.get(messageId);
  }

  // Get all messages from a specific timestamp onwards
  getMessagesFromPoint(conversationId, fromTimestamp) {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? AND created_at >= ?
      ORDER BY created_at ASC
    `);
    
    return stmt.all(conversationId, fromTimestamp);
  }

  // Update conversation's last_message_at to the most recent remaining message
  updateConversationLastMessage(conversationId) {
    try {
      // Get the most recent remaining message
      const getLastMessageStmt = db.prepare(`
        SELECT created_at FROM messages 
        WHERE conversation_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      const lastMessage = getLastMessageStmt.get(conversationId);
      
      // Update conversation timestamp
      const updateConversationStmt = db.prepare(`
        UPDATE conversations 
        SET last_message_at = ?, updated_at = ?
        WHERE id = ?
      `);
      
      const timestamp = lastMessage ? lastMessage.created_at : new Date().toISOString();
      updateConversationStmt.run(timestamp, new Date().toISOString(), conversationId);
      
      console.log(`[DELETE] Updated conversation ${conversationId} last_message_at`);
      
    } catch (error) {
      console.error(`[DELETE] Error updating conversation timestamp:`, error);
      // Don't throw - this is not critical
    }
  }

  // Get messages count for a conversation (for verification)
  getConversationMessageCount(conversationId) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?');
    const { count } = stmt.get(conversationId);
    return count;
  }

  // Delete a single message (for future single message deletion feature)
  deleteSingleMessage(messageId, userId) {
    try {
      // Get message with conversation info
      const stmt = db.prepare(`
        SELECT m.*, c.user_id as conversation_user_id
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE m.id = ?
      `);
      
      const message = stmt.get(messageId);
      
      if (!message) {
        throw new Error('Message not found');
      }
      
      if (message.conversation_user_id !== userId) {
        throw new Error('Access denied');
      }

      // Delete message variations
      variationDatabaseService.clearVariations(messageId);

      // Delete the message
      const deleteStmt = db.prepare('DELETE FROM messages WHERE id = ?');
      const result = deleteStmt.run(messageId);

      // Update conversation timestamp
      this.updateConversationLastMessage(message.conversation_id);

      console.log(`[DELETE] Deleted single message ${messageId}`);

      return {
        deletedCount: result.changes,
        deletedMessageIds: [messageId],
        conversationId: message.conversation_id
      };

    } catch (error) {
      console.error(`[DELETE] Error deleting single message ${messageId}:`, error);
      throw error;
    }
  }
}

module.exports = new MessageDeleteService();