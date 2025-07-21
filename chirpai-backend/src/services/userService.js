const db = require('../database/db');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.display_name = data.display_name;
    this.avatar = data.avatar;
    this.bio = data.bio;
    this.followers_count = data.followers_count || 0;
    this.following_count = data.following_count || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Format follower count for display
  getFormattedFollowerCount() {
    if (this.followers_count >= 1000) {
      return (this.followers_count / 1000).toFixed(1) + 'k';
    }
    return this.followers_count.toString();
  }

  // Format following count for display
  getFormattedFollowingCount() {
    if (this.following_count >= 1000) {
      return (this.following_count / 1000).toFixed(1) + 'k';
    }
    return this.following_count.toString();
  }
}

const getAllUsers = () => {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  const rows = stmt.all();
  return rows.map(row => new User(row));
};

const getUserById = (id) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(id);
  return row ? new User(row) : null;
};

const getUserByUsername = (username) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const row = stmt.get(username);
  return row ? new User(row) : null;
};

const createUser = (userData) => {
  const stmt = db.prepare(`
    INSERT INTO users (username, display_name, avatar, bio, followers_count, following_count)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  // Use provided avatar or create default one
  const avatarUrl = userData.avatar || `https://via.placeholder.com/150/6366f1/ffffff?text=${userData.username.charAt(0).toUpperCase()}`;
  
  const result = stmt.run(
    userData.username,
    userData.display_name || userData.username,
    avatarUrl,
    userData.bio || '',
    0, // Starting followers
    0  // Starting following
  );
  
  return getUserById(result.lastInsertRowid);
};

const updateUser = (id, updates) => {
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);
  
  return result.changes > 0;
};

const deleteUser = (id) => {
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};

// Session management
const getCurrentUser = () => {
  const stmt = db.prepare('SELECT current_user_id FROM user_session WHERE id = 1');
  const session = stmt.get();
  
  if (session && session.current_user_id) {
    return getUserById(session.current_user_id);
  }
  
  return null;
};

const setCurrentUser = (userId) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_session (id, current_user_id, updated_at)
    VALUES (1, ?, CURRENT_TIMESTAMP)
  `);
  
  return stmt.run(userId);
};

const getAdminMode = () => {
  const stmt = db.prepare('SELECT is_admin_mode FROM user_session WHERE id = 1');
  const session = stmt.get();
  return session ? Boolean(session.is_admin_mode) : false;
};

const setAdminMode = (isAdmin) => {
  const stmt = db.prepare(`
    UPDATE user_session 
    SET is_admin_mode = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = 1
  `);
  
  return stmt.run(isAdmin ? 1 : 0); // Convert boolean to integer
};

const getUserSession = () => {
  const stmt = db.prepare(`
    SELECT us.*, u.username, u.display_name
    FROM user_session us
    LEFT JOIN users u ON us.current_user_id = u.id
    WHERE us.id = 1
  `);
  
  return stmt.get();
};

// Check if any users exist
const hasUsers = () => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const { count } = stmt.get();
  return count > 0;
};

module.exports = {
  User,
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  setCurrentUser,
  getAdminMode,
  setAdminMode,
  getUserSession,
  hasUsers
};