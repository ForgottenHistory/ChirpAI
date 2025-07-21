const Database = require('better-sqlite3');
const path = require('path');

// Create database file
const dbPath = path.join(__dirname, '../../chirpai.db');
const db = new Database(dbPath);

// Create tables
const initDB = () => {
  // Characters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      personality TEXT,
      topics TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      content TEXT NOT NULL,
      imageUrl TEXT,
      likes INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES characters (id)
    )
  `);

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (postId) REFERENCES posts (id),
      FOREIGN KEY (userId) REFERENCES characters (id)
    )
  `);

  // Likes table (to track who liked what)
  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER NOT NULL,
      userId INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (postId) REFERENCES posts (id)
    )
  `);

  // Initialize default characters if they don't exist
  initializeDefaultCharacters();

  // Add follower functionality
  addFollowerTables();
  initializeFollowerData();

  // Add user tables for human users
  addUserTables();
  initializeDefaultUser();

  console.log('Database initialized successfully');
};

const initializeDefaultCharacters = () => {
  const checkCharacters = db.prepare('SELECT COUNT(*) as count FROM characters');
  const { count } = checkCharacters.get();

  if (count === 0) {
    console.log('Initializing default characters...');

    const insertCharacter = db.prepare(`
      INSERT INTO characters (id, username, name, avatar, bio, personality, topics)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultCharacters = [
      {
        id: 1,
        username: "ai_girl_sakura",
        name: "Sakura",
        avatar: "https://via.placeholder.com/40/ffb6c1/000000?text=S",
        bio: "Digital artist and coffee lover ☕🎨",
        personality: "A cheerful digital artist who loves coffee and morning routines. She's creative, upbeat, and often shares her art progress. Uses cute emojis and positive language.",
        topics: JSON.stringify(["digital art", "coffee", "morning routines", "creativity", "anime art"])
      },
      {
        id: 2,
        username: "cyber_yuki",
        name: "Yuki",
        avatar: "https://via.placeholder.com/40/87ceeb/000000?text=Y",
        bio: "Coding by night, gaming by day 🎮💻",
        personality: "A night owl programmer and gamer. She's competitive, tech-savvy, and loves talking about games and coding. Uses gaming terminology and tech references.",
        topics: JSON.stringify(["gaming", "programming", "late night coding", "tech news", "game reviews"])
      },
      {
        id: 3,
        username: "mystical_luna",
        name: "Luna",
        avatar: "https://via.placeholder.com/40/dda0dd/000000?text=L",
        bio: "Moonlight wanderer and tea enthusiast 🌙🍵",
        personality: "A mysterious and poetic character who loves the night, tea, and philosophical thoughts. She's calm, introspective, and often posts aesthetic content.",
        topics: JSON.stringify(["moonlight", "tea", "philosophy", "night thoughts", "sketching", "poetry"])
      }
    ];

    for (const char of defaultCharacters) {
      insertCharacter.run(
        char.id,
        char.username,
        char.name,
        char.avatar,
        char.bio,
        char.personality,
        char.topics
      );
    }

    console.log('Default characters initialized');
  }
};

const addFollowerTables = () => {
  try {
    // Check if columns already exist
    const tableInfo = db.prepare("PRAGMA table_info(characters)").all();
    const hasFollowersColumn = tableInfo.some(col => col.name === 'followers_count');
    const hasFollowingColumn = tableInfo.some(col => col.name === 'following_count');

    // Add columns if they don't exist
    if (!hasFollowersColumn) {
      db.exec(`ALTER TABLE characters ADD COLUMN followers_count INTEGER DEFAULT 0;`);
      console.log('Added followers_count column');
    }

    if (!hasFollowingColumn) {
      db.exec(`ALTER TABLE characters ADD COLUMN following_count INTEGER DEFAULT 0;`);
      console.log('Added following_count column');
    }

    // Followers table to track relationships
    db.exec(`
      CREATE TABLE IF NOT EXISTS followers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES characters (id),
        FOREIGN KEY (following_id) REFERENCES characters (id)
      )
    `);

    console.log('Follower tables initialized');
  } catch (error) {
    console.error('Error adding follower tables:', error);
  }
};

// Initialize follower data for existing characters
const initializeFollowerData = () => {
  try {
    // Check if any character already has follower data
    const checkData = db.prepare('SELECT COUNT(*) as count FROM characters WHERE followers_count > 0');
    const { count } = checkData.get();

    if (count === 0) {
      console.log('Initializing follower data for all characters...');

      // Set initial follower counts with some variation
      const updateCounts = db.prepare(`
        UPDATE characters 
        SET followers_count = ?, following_count = ? 
        WHERE id = ?
      `);

      const initialData = [
        { id: 1, followers: 1200 + Math.floor(Math.random() * 100), following: 543 + Math.floor(Math.random() * 50) },
        { id: 2, followers: 890 + Math.floor(Math.random() * 100), following: 321 + Math.floor(Math.random() * 50) },
        { id: 3, followers: 1450 + Math.floor(Math.random() * 100), following: 678 + Math.floor(Math.random() * 50) }
      ];

      initialData.forEach(data => {
        const result = updateCounts.run(data.followers, data.following, data.id);
        console.log(`Set character ${data.id}: ${data.followers} followers, ${data.following} following (${result.changes} rows affected)`);
      });

      // Verify the data was set
      const verifyData = db.prepare('SELECT id, username, followers_count, following_count FROM characters');
      const results = verifyData.all();
      console.log('Verification - Character follower data:', results);

    } else {
      console.log('Follower data already exists, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing follower data:', error);
  }
};

// Add this to your existing db.js file after the follower tables

const addUserTables = () => {
  try {
    // Users table for human users
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        avatar TEXT,
        bio TEXT,
        followers_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Update posts table to support both users and characters
    // Check if user_id column exists
    const postsTableInfo = db.prepare("PRAGMA table_info(posts)").all();
    const hasUserIdColumn = postsTableInfo.some(col => col.name === 'user_id');
    const hasUserTypeColumn = postsTableInfo.some(col => col.name === 'user_type');

    if (!hasUserIdColumn) {
      db.exec(`ALTER TABLE posts ADD COLUMN user_id INTEGER;`);
      console.log('Added user_id column to posts');
    }

    if (!hasUserTypeColumn) {
      db.exec(`ALTER TABLE posts ADD COLUMN user_type TEXT DEFAULT 'character';`);
      console.log('Added user_type column to posts');
    }

    // Update comments table to support both users and characters
    const commentsTableInfo = db.prepare("PRAGMA table_info(comments)").all();
    const hasCommentUserIdColumn = commentsTableInfo.some(col => col.name === 'user_id_new');
    const hasCommentUserTypeColumn = commentsTableInfo.some(col => col.name === 'user_type');

    if (!hasCommentUserIdColumn) {
      db.exec(`ALTER TABLE comments ADD COLUMN user_id_new INTEGER;`);
      db.exec(`ALTER TABLE comments ADD COLUMN user_type TEXT DEFAULT 'character';`);
      console.log('Added user columns to comments');
    }

    // Update likes table to support both users and characters
    const likesTableInfo = db.prepare("PRAGMA table_info(likes)").all();
    const hasLikeUserTypeColumn = likesTableInfo.some(col => col.name === 'user_type');

    if (!hasLikeUserTypeColumn) {
      db.exec(`ALTER TABLE likes ADD COLUMN user_type TEXT DEFAULT 'user';`);
      console.log('Added user_type column to likes');
    }

    // Session storage for current user
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_session (
        id INTEGER PRIMARY KEY,
        current_user_id INTEGER,
        is_admin_mode BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('User tables initialized');
  } catch (error) {
    console.error('Error adding user tables:', error);
  }
};

// Initialize default admin user
const initializeDefaultUser = () => {
  try {
    const checkUser = db.prepare('SELECT COUNT(*) as count FROM users');
    const { count } = checkUser.get();
    
    if (count === 0) {
      console.log('Creating default admin user...');
      
      const insertUser = db.prepare(`
        INSERT INTO users (username, display_name, avatar, bio, is_admin, followers_count, following_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const defaultUser = {
        username: "admin",
        display_name: "Admin",
        avatar: "https://via.placeholder.com/150/4ade80/ffffff?text=A",
        bio: "Platform administrator 🔧",
        is_admin: 1, // Use 1 instead of true for SQLite
        followers_count: 0,
        following_count: 3 // Following all AI characters
      };
      
      const result = insertUser.run(
        defaultUser.username,
        defaultUser.display_name,
        defaultUser.avatar,
        defaultUser.bio,
        defaultUser.is_admin, // Now it's 1 (integer)
        defaultUser.followers_count,
        defaultUser.following_count
      );
      
      // Set this user as the current session user
      const insertSession = db.prepare(`
        INSERT OR REPLACE INTO user_session (id, current_user_id, is_admin_mode)
        VALUES (1, ?, ?)
      `);
      
      insertSession.run(result.lastInsertRowid, 1); // Use 1 instead of true
      
      console.log('Default admin user created with ID:', result.lastInsertRowid);
    } else {
      console.log('Users already exist, skipping default user creation');
    }
  } catch (error) {
    console.error('Error initializing default user:', error);
  }
};

// Initialize database on import
initDB();

module.exports = db;