const db = require('../database/db');

class Character {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.name = data.name;
    this.avatar = data.avatar;
    this.bio = data.bio;
    this.personality = data.personality;
    this.topics = JSON.parse(data.topics || '[]');
    this.followers_count = data.followers_count || 0;
    this.following_count = data.following_count || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Convert back to database format
  toDBFormat() {
    return {
      id: this.id,
      username: this.username,
      name: this.name,
      avatar: this.avatar,
      bio: this.bio,
      personality: this.personality,
      topics: JSON.stringify(this.topics),
      followers_count: this.followers_count,
      following_count: this.following_count
    };
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

const getAllCharacters = () => {
  const stmt = db.prepare('SELECT * FROM characters ORDER BY id ASC');
  const rows = stmt.all();
  return rows.map(row => new Character(row));
};

const getCharacterById = (id) => {
  const stmt = db.prepare('SELECT * FROM characters WHERE id = ?');
  const row = stmt.get(id);
  return row ? new Character(row) : null;
};

const getCharacterByUsername = (username) => {
  const stmt = db.prepare('SELECT * FROM characters WHERE username = ?');
  const row = stmt.get(username);
  return row ? new Character(row) : null;
};

const updateCharacterAvatar = (id, avatarUrl) => {
  const stmt = db.prepare(`
    UPDATE characters 
    SET avatar = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  
  const result = stmt.run(avatarUrl, id);
  console.log(`Updated avatar for character ${id}: ${avatarUrl}`);
  return result.changes > 0;
};

const updateCharacterFollowerCounts = (id, followersCount, followingCount) => {
  const stmt = db.prepare(`
    UPDATE characters 
    SET followers_count = ?, following_count = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  
  const result = stmt.run(followersCount, followingCount, id);
  return result.changes > 0;
};

const createCharacter = (characterData) => {
  const character = new Character(characterData);
  const data = character.toDBFormat();
  
  const stmt = db.prepare(`
    INSERT INTO characters (username, name, avatar, bio, personality, topics, followers_count, following_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.username,
    data.name,
    data.avatar,
    data.bio,
    data.personality,
    data.topics,
    data.followers_count || 100, // Default starting followers
    data.following_count || 50   // Default starting following
  );
  
  return getCharacterById(result.lastInsertRowid);
};

const updateCharacter = (id, updates) => {
  const fields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'topics' && Array.isArray(value)) {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`UPDATE characters SET ${fields.join(', ')} WHERE id = ?`);
  const result = stmt.run(...values);
  
  return result.changes > 0;
};

// Helper function to get character personalities for AI service
const getCharacterPersonalities = () => {
  const characters = getAllCharacters();
  const personalities = {};
  
  characters.forEach(char => {
    personalities[char.id] = {
      name: char.name,
      personality: char.personality,
      topics: char.topics
    };
  });
  
  return personalities;
};

module.exports = {
  Character,
  getAllCharacters,
  getCharacterById,
  getCharacterByUsername,
  updateCharacterAvatar,
  updateCharacterFollowerCounts,
  createCharacter,
  updateCharacter,
  getCharacterPersonalities
};