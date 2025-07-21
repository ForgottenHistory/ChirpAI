// Script to clean the user system and remove admin user concept
// Run this with: node src/scripts/cleanUserSystem.js

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../chirpai.db');
const db = new Database(dbPath);

console.log('Cleaning user system...');

try {
  // Drop all user-related tables to start fresh
  console.log('Dropping user tables...');
  db.exec('DROP TABLE IF EXISTS users');
  db.exec('DROP TABLE IF EXISTS user_session');
  
  // Create new users table without is_admin column
  console.log('Creating new users table...');
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create new user_session table (keep admin mode as session setting)
  console.log('Creating new user_session table...');
  db.exec(`
    CREATE TABLE user_session (
      id INTEGER PRIMARY KEY,
      current_user_id INTEGER,
      is_admin_mode INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create initial session record with no user and admin mode off
  console.log('Creating initial session...');
  db.exec(`
    INSERT INTO user_session (id, current_user_id, is_admin_mode)
    VALUES (1, NULL, 0)
  `);

  console.log('User system cleaned successfully!');
  console.log('- No default admin user');
  console.log('- Admin mode is now just a session toggle');
  console.log('- First user created will trigger onboarding');
  
  // Verify
  const session = db.prepare('SELECT * FROM user_session').all();
  const users = db.prepare('SELECT * FROM users').all();
  
  console.log('\nVerification:');
  console.log('Session:', session);
  console.log('Users:', users);
  
} catch (error) {
  console.error('Error cleaning user system:', error);
} finally {
  db.close();
}