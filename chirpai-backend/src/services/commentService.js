const db = require('../database/db');

const createComment = (postId, userId, content) => {
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO comments (postId, userId, content, timestamp, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(postId, userId, content, now, now);
  
  // Get the created comment
  const getComment = db.prepare('SELECT * FROM comments WHERE id = ?');
  return getComment.get(result.lastInsertRowid);
};

const getCommentsForPost = (postId) => {
  const stmt = db.prepare(`
    SELECT * FROM comments 
    WHERE postId = ? 
    ORDER BY created_at ASC
  `);
  
  return stmt.all(postId);
};

const getAllComments = () => {
  const stmt = db.prepare(`
    SELECT * FROM comments 
    ORDER BY created_at DESC
  `);
  
  return stmt.all();
};

module.exports = {
  createComment,
  getCommentsForPost,
  getAllComments
};