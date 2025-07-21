const db = require('../database/db');

// Get or create a conversation between a user and character
const getOrCreateConversation = (userId, characterId) => {
  // First try to find existing conversation
  const findStmt = db.prepare(`
    SELECT * FROM conversations 
    WHERE user_id = ? AND character_id = ?
  `);
  
  let conversation = findStmt.get(userId, characterId);
  
  if (!conversation) {
    // Create new conversation
    const createStmt = db.prepare(`
      INSERT INTO conversations (user_id, character_id)
      VALUES (?, ?)
    `);
    
    const result = createStmt.run(userId, characterId);
    conversation = findStmt.get(userId, characterId);
  }
  
  return conversation;
};

// Get all conversations for a user
const getUserConversations = (userId) => {
  const stmt = db.prepare(`
    SELECT c.*, 
           ch.username as character_username,
           ch.name as character_name,
           ch.avatar as character_avatar,
           m.content as last_message_content,
           m.sender_type as last_message_sender_type,
           m.created_at as last_message_time
    FROM conversations c
    JOIN characters ch ON c.character_id = ch.id
    LEFT JOIN messages m ON m.conversation_id = c.id 
      AND m.id = (
        SELECT MAX(id) FROM messages 
        WHERE conversation_id = c.id
      )
    WHERE c.user_id = ?
    ORDER BY c.last_message_at DESC
  `);
  
  return stmt.all(userId);
};

// Get messages for a specific conversation
const getConversationMessages = (conversationId, limit = 50) => {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);
  
  const messages = stmt.all(conversationId, limit);
  return messages.reverse(); // Return oldest first for display
};

// Send a message in a conversation
const sendMessage = (conversationId, senderType, senderId, content) => {
  const now = new Date().toISOString();
  
  // Insert the message
  const insertStmt = db.prepare(`
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = insertStmt.run(conversationId, senderType, senderId, content, now);
  
  // Update conversation's last_message_at
  const updateStmt = db.prepare(`
    UPDATE conversations 
    SET last_message_at = ?, updated_at = ?
    WHERE id = ?
  `);
  
  updateStmt.run(now, now, conversationId);
  
  // Get the created message
  const getMessage = db.prepare('SELECT * FROM messages WHERE id = ?');
  return getMessage.get(result.lastInsertRowid);
};

// Mark messages as read
const markMessagesAsRead = (conversationId, senderType) => {
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE messages 
    SET read_at = ?
    WHERE conversation_id = ? AND sender_type = ? AND read_at IS NULL
  `);
  
  return stmt.run(now, conversationId, senderType);
};

// Get unread message count for a user
const getUnreadMessageCount = (userId) => {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE c.user_id = ? AND m.sender_type = 'character' AND m.read_at IS NULL
  `);
  
  const result = stmt.get(userId);
  return result.count;
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount
};