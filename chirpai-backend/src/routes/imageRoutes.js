const express = require('express');
const router = express.Router();
const { generateAvatar } = require('../services/avatarService');

// Avatar generation endpoint
router.post('/generate-avatar', async (req, res) => {
  try {
    const { characterId } = req.body;
    const result = await generateAvatar(characterId);
    
    // Update the character's avatar in the database
    const { updateCharacterAvatar } = require('../services/characterService');
    updateCharacterAvatar(characterId, result.avatarUrl);
    
    res.json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating avatar:`, error);
    res.status(500).json({ error: 'Failed to generate avatar' });
  }
});

module.exports = router;