const db = require('../../database/db');

class VariationDatabaseService {
  constructor() {
    this.initializeDatabase();
  }

  // Initialize database tables if they don't exist
  initializeDatabase() {
    try {
      db.exec(`
        CREATE TABLE IF NOT EXISTS message_variations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message_id INTEGER NOT NULL,
          variation_index INTEGER NOT NULL,
          content TEXT NOT NULL,
          is_original BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT (datetime('now')),
          FOREIGN KEY (message_id) REFERENCES messages (id),
          UNIQUE(message_id, variation_index)
        )
      `);
      console.log('[VARIATION_DB] Message variations table initialized');
    } catch (error) {
      console.error('[VARIATION_DB] Error initializing database:', error);
    }
  }

  // Get next available variation index safely
  getNextVariationIndex(messageId) {
    const stmt = db.prepare('SELECT COALESCE(MAX(variation_index), -1) + 1 as next_index FROM message_variations WHERE message_id = ?');
    const { next_index } = stmt.get(messageId);
    return next_index;
  }

  // Insert original variation if it doesn't exist
  insertOriginalVariation(messageId, originalContent) {
    try {
      const insertOriginalStmt = db.prepare(`
        INSERT OR IGNORE INTO message_variations (message_id, variation_index, content, is_original)
        VALUES (?, 0, ?, 1)
      `);
      
      const result = insertOriginalStmt.run(messageId, originalContent);
      
      if (result.changes > 0) {
        console.log(`[VARIATION_DB] Stored original content for message ${messageId}`);
      }
      
      return result.changes > 0;
    } catch (error) {
      console.error(`[VARIATION_DB] Error inserting original variation for message ${messageId}:`, error);
      return false;
    }
  }

  // Insert new variation
  insertVariation(messageId, variationIndex, content, isOriginal = false) {
    const insertVariationStmt = db.prepare(`
      INSERT INTO message_variations (message_id, variation_index, content, is_original)
      VALUES (?, ?, ?, ?)
    `);
    
    return insertVariationStmt.run(messageId, variationIndex, content, isOriginal ? 1 : 0);
  }

  // Get all variations for a message
  getVariations(messageId) {
    const stmt = db.prepare(`
      SELECT * FROM message_variations 
      WHERE message_id = ? 
      ORDER BY variation_index ASC
    `);
    
    const variations = stmt.all(messageId);
    return variations.map(v => ({
      id: v.id,
      content: v.content,
      index: v.variation_index,
      isOriginal: Boolean(v.is_original),
      createdAt: v.created_at
    }));
  }

  // Get specific variation by index
  getVariation(messageId, index) {
    const stmt = db.prepare(`
      SELECT * FROM message_variations 
      WHERE message_id = ? AND variation_index = ?
    `);
    
    const variation = stmt.get(messageId, index);
    if (!variation) return null;

    return {
      id: variation.id,
      content: variation.content,
      index: variation.variation_index,
      isOriginal: Boolean(variation.is_original),
      createdAt: variation.created_at
    };
  }

  // Clear all variations for a message
  clearVariations(messageId) {
    const stmt = db.prepare('DELETE FROM message_variations WHERE message_id = ?');
    const result = stmt.run(messageId);
    console.log(`[VARIATION_DB] Cleared ${result.changes} variations for message ${messageId}`);
    return result.changes;
  }

  // Get variation count
  getVariationCount(messageId) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM message_variations WHERE message_id = ?');
    const { count } = stmt.get(messageId);
    return count;
  }

  // Get variation content as array
  getVariationContents(messageId) {
    const variations = this.getVariations(messageId);
    return variations.map(v => v.content);
  }

  // Initialize existing messages with original variations
  initializeExistingMessages() {
    try {
      const getAllCharacterMessagesStmt = db.prepare(`
        SELECT id, content FROM messages WHERE sender_type = 'character'
      `);
      
      const characterMessages = getAllCharacterMessagesStmt.all();
      let initialized = 0;

      characterMessages.forEach(message => {
        try {
          if (this.insertOriginalVariation(message.id, message.content)) {
            initialized++;
          }
        } catch (error) {
          console.error(`[VARIATION_DB] Error initializing message ${message.id}:`, error);
        }
      });

      if (initialized > 0) {
        console.log(`[VARIATION_DB] Initialized ${initialized} existing messages with original variations`);
      }

    } catch (error) {
      console.error('[VARIATION_DB] Error initializing existing messages:', error);
    }
  }
}

module.exports = new VariationDatabaseService();