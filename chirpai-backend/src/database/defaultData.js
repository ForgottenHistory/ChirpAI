const initializeDefaultData = (db) => {
  initializeDefaultCharacters(db);
  initializeFollowerData(db);
  initializeUserSession(db);
  fixUserPosts(db);
};

const initializeDefaultCharacters = (db) => {
  const checkCharacters = db.prepare('SELECT COUNT(*) as count FROM characters');
  const { count } = checkCharacters.get();
  
  if (count === 0) {
    console.log('Initializing default characters...');
    
    const insertCharacter = db.prepare(`
      INSERT INTO characters (id, username, name, avatar, bio, personality, topics, followers_count, following_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const defaultCharacters = [
      {
        id: 1,
        username: "ai_girl_sakura",
        name: "Sakura",
        avatar: "https://via.placeholder.com/40/ffb6c1/000000?text=S",
        bio: "Digital artist and coffee lover ☕🎨",
        personality: "A cheerful digital artist who loves coffee and morning routines. She's creative, upbeat, and often shares her art progress. Uses cute emojis and positive language.",
        topics: JSON.stringify(["digital art", "coffee", "morning routines", "creativity", "anime art"]),
        followers_count: 1200 + Math.floor(Math.random() * 100),
        following_count: 543 + Math.floor(Math.random() * 50)
      },
      {
        id: 2,
        username: "cyber_yuki",
        name: "Yuki",
        avatar: "https://via.placeholder.com/40/87ceeb/000000?text=Y",
        bio: "Coding by night, gaming by day 🎮💻",
        personality: "A night owl programmer and gamer. She's competitive, tech-savvy, and loves talking about games and coding. Uses gaming terminology and tech references.",
        topics: JSON.stringify(["gaming", "programming", "late night coding", "tech news", "game reviews"]),
        followers_count: 890 + Math.floor(Math.random() * 100),
        following_count: 321 + Math.floor(Math.random() * 50)
      },
      {
        id: 3,
        username: "mystical_luna",
        name: "Luna",
        avatar: "https://via.placeholder.com/40/dda0dd/000000?text=L",
        bio: "Moonlight wanderer and tea enthusiast 🌙🍵",
        personality: "A mysterious and poetic character who loves the night, tea, and philosophical thoughts. She's calm, introspective, and often posts aesthetic content.",
        topics: JSON.stringify(["moonlight", "tea", "philosophy", "night thoughts", "sketching", "poetry"]),
        followers_count: 1450 + Math.floor(Math.random() * 100),
        following_count: 678 + Math.floor(Math.random() * 50)
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
        char.topics,
        char.followers_count,
        char.following_count
      );
    }
    
    console.log('Default characters initialized');
  }
};

const initializeFollowerData = (db) => {
  try {
    // Check if follower columns exist and add them if needed
    const tableInfo = db.prepare("PRAGMA table_info(characters)").all();
    const hasFollowersColumn = tableInfo.some(col => col.name === 'followers_count');
    const hasFollowingColumn = tableInfo.some(col => col.name === 'following_count');
    
    if (!hasFollowersColumn) {
      db.exec(`ALTER TABLE characters ADD COLUMN followers_count INTEGER DEFAULT 0;`);
      console.log('Added followers_count column');
    }
    
    if (!hasFollowingColumn) {
      db.exec(`ALTER TABLE characters ADD COLUMN following_count INTEGER DEFAULT 0;`);
      console.log('Added following_count column');
    }

    console.log('Follower functionality initialized');
  } catch (error) {
    console.error('Error initializing follower data:', error);
  }
};

const initializeUserSession = (db) => {
  // Create initial session with no user
  const checkSession = db.prepare('SELECT COUNT(*) as count FROM user_session');
  const { count } = checkSession.get();
  
  if (count === 0) {
    db.exec(`
      INSERT INTO user_session (id, current_user_id, is_admin_mode)
      VALUES (1, NULL, 0)
    `);
    console.log('Initial user session created');
  }
};

const fixUserPosts = (db) => {
  try {
    // First, let's see what posts exist
    const allPosts = db.prepare('SELECT id, userId, user_id, user_type FROM posts').all();
    console.log('Current posts in database:', allPosts);
    
    // Fix any existing user posts to have userId = 0 and proper user_type
    const updateUserPosts = db.prepare(`
      UPDATE posts 
      SET userId = 0, user_type = 'user'
      WHERE user_id IS NOT NULL AND user_id != 0 AND userId != 0
    `);
    
    const result1 = updateUserPosts.run();
    if (result1.changes > 0) {
      console.log(`Fixed ${result1.changes} user posts to have correct userId = 0 and user_type = 'user'`);
    }
    
    // Set user_type to 'character' for posts that don't have it set and have a valid character userId
    const updateCharacterPosts = db.prepare(`
      UPDATE posts 
      SET user_type = 'character'
      WHERE user_type IS NULL AND userId > 0
    `);
    
    const result2 = updateCharacterPosts.run();
    if (result2.changes > 0) {
      console.log(`Fixed ${result2.changes} character posts to have user_type = 'character'`);
    }
    
    // Check results
    const updatedPosts = db.prepare('SELECT id, userId, user_id, user_type FROM posts').all();
    console.log('Updated posts in database:', updatedPosts);
    
  } catch (error) {
    console.error('Error fixing user posts:', error);
  }
};

module.exports = { initializeDefaultData };