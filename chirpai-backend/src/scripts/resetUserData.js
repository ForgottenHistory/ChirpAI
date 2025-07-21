// Script to reset and initialize user data
// Run this with: node src/scripts/resetUserData.js

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../chirpai.db');
const db = new Database(dbPath);

console.log('Resetting user data...');

try {
  // Drop existing user tables to start fresh
  console.log('Dropping existing user tables...');
  db.exec('DROP TABLE IF EXISTS users');
  db.exec('DROP TABLE IF EXISTS user_session');
  
  // Create users table
  console.log('Creating users table...');
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create user_session table
  console.log('Creating user_session table...');
  db.exec(`
    CREATE TABLE user_session (
      id INTEGER PRIMARY KEY,
      current_user_id INTEGER,
      is_admin_mode INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create default admin user
  console.log('Creating default admin user...');
  const insertUser = db.prepare(`
    INSERT INTO users (username, display_name, avatar, bio, is_admin, followers_count, following_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = insertUser.run(
    "admin",
    "Admin",
    "https://via.placeholder.com/150/4ade80/ffffff?text=A",
    "Platform administrator 🔧",
    1, // is_admin = 1 (true)
    0, // followers_count
    3  // following_count
  );
  
  console.log('Admin user created with ID:', result.lastInsertRowid);
  
  // Set admin as current session user
  console.log('Setting up user session...');
  const insertSession = db.prepare(`
    INSERT INTO user_session (id, current_user_id, is_admin_mode)
    VALUES (1, ?, ?)
  `);
  
  insertSession.run(result.lastInsertRowid, 1); // is_admin_mode = 1 (true)
  
  // Verify the data
  console.log('\nVerifying user data:');
  const users = db.prepare('SELECT * FROM users').all();
  const session = db.prepare('SELECT * FROM user_session').all();
  
  console.log('Users:', users);
  console.log('Session:', session);
  
  console.log('\nUser data reset complete!');
  
} catch (error) {
  console.error('Error resetting user data:', error);
} finally {
  db.close();
}