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

// Initialize database on import
initDB();

module.exports = db;