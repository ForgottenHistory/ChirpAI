const db = require('../database/db');

const createPost = (userId, content, imageUrl = null, userType = 'character') => {
  if (userType === 'user') {
    // For user posts, we still need to set userId (for compatibility) and user_id/user_type
    const stmt = db.prepare(`
      INSERT INTO posts (userId, user_id, content, imageUrl, likes, user_type)
      VALUES (?, ?, ?, ?, 0, 'user')
    `);
    
    const result = stmt.run(userId, userId, content, imageUrl);
    
    // Get the created post
    const getPost = db.prepare('SELECT * FROM posts WHERE id = ?');
    return getPost.get(result.lastInsertRowid);
  } else {
    // Original character post logic
    const stmt = db.prepare(`
      INSERT INTO posts (userId, content, imageUrl, likes)
      VALUES (?, ?, ?, 0)
    `);
    
    const result = stmt.run(userId, content, imageUrl);
    
    // Get the created post
    const getPost = db.prepare('SELECT * FROM posts WHERE id = ?');
    return getPost.get(result.lastInsertRowid);
  }
};

const getAllPosts = () => {
  const stmt = db.prepare(`
    SELECT *, 
           COALESCE(user_type, 'character') as user_type,
           COALESCE(user_id, userId) as user_id
    FROM posts 
    ORDER BY created_at DESC
  `);
  
  return stmt.all();
};

const getPostById = (id) => {
  const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
  return stmt.get(id);
};

const updatePostLikes = (postId, likes) => {
  const stmt = db.prepare('UPDATE posts SET likes = ? WHERE id = ?');
  return stmt.run(likes, postId);
};

const addLike = (postId, userId = 0) => {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO likes (postId, userId)
    VALUES (?, ?)
  `);
  
  const result = stmt.run(postId, userId);
  
  // Update post likes count
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM likes WHERE postId = ?');
  const { count } = countStmt.get(postId);
  
  updatePostLikes(postId, count);
  
  return result.changes > 0;
};

const removeLike = (postId, userId = 0) => {
  const stmt = db.prepare(`
    DELETE FROM likes WHERE postId = ? AND userId = ?
  `);
  
  const result = stmt.run(postId, userId);
  
  // Update post likes count
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM likes WHERE postId = ?');
  const { count } = countStmt.get(postId);
  
  updatePostLikes(postId, count);
  
  return result.changes > 0;
};

const isPostLiked = (postId, userId = 0) => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM likes WHERE postId = ? AND userId = ?');
  const { count } = stmt.get(postId, userId);
  return count > 0;
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePostLikes,
  addLike,
  removeLike,
  isPostLiked
};