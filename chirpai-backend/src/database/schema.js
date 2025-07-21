const initializeTables = (db) => {
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
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  // Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      user_id INTEGER,
      user_type TEXT DEFAULT 'character',
      content TEXT NOT NULL,
      imageUrl TEXT,
      likes INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT (datetime('now')),
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES characters (id)
    )
  `);

  // Add user_type column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE posts ADD COLUMN user_type TEXT DEFAULT 'character'`);
    console.log('Added user_type column to posts table');
  } catch (error) {
    // Column already exists, ignore error
    if (!error.message.includes('duplicate column name')) {
      console.error('Error adding user_type column:', error);
    }
  }

  // Add user_id column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE posts ADD COLUMN user_id INTEGER`);
    console.log('Added user_id column to posts table');
  } catch (error) {
    // Column already exists, ignore error
    if (!error.message.includes('duplicate column name')) {
      console.error('Error adding user_id column:', error);
    }
  }

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      user_id_new INTEGER,
      user_type TEXT DEFAULT 'character',
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT (datetime('now')),
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (postId) REFERENCES posts (id),
      FOREIGN KEY (userId) REFERENCES characters (id)
    )
  `);

  // Likes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      postId INTEGER NOT NULL,
      userId INTEGER DEFAULT 0,
      user_type TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (postId) REFERENCES posts (id)
    )
  `);

  // Followers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS followers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER NOT NULL,
      following_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT (datetime('now')),
      UNIQUE(follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES characters (id),
      FOREIGN KEY (following_id) REFERENCES characters (id)
    )
  `);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      avatar TEXT,
      bio TEXT,
      followers_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  // User session table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_session (
      id INTEGER PRIMARY KEY,
      current_user_id INTEGER,
      is_admin_mode BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    )
  `);

  console.log('Database tables initialized');
};

module.exports = { initializeTables };