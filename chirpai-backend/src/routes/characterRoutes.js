const express = require('express');
const router = express.Router();
const { getCharacters, updateAvatar } = require('../controllers/characterController');

// Character routes
router.get('/characters', getCharacters);
router.post('/update-avatar', updateAvatar);

// Debug endpoint to check character data
router.get('/debug/characters', (req, res) => {
  try {
    const db = require('../database/db');
    const characters = db.prepare('SELECT * FROM characters').all();
    
    console.log('Raw character data from database:', characters);
    
    res.json({
      message: 'Character data from database',
      characters: characters.map(char => ({
        id: char.id,
        username: char.username,
        followers_count: char.followers_count,
        following_count: char.following_count,
        raw: char
      }))
    });
  } catch (error) {
    console.error('Error fetching debug character data:', error);
    res.status(500).json({ error: 'Failed to fetch debug data' });
  }
});

module.exports = router;