const { getAllCharacters, updateCharacterAvatar } = require('../services/characterService');

const getCharacters = (req, res) => {
  try {
    const characters = getAllCharacters();
    
    // Convert to frontend format
    const formattedCharacters = characters.map(char => ({
      id: char.id,
      username: char.username,
      name: char.name,
      avatar: char.avatar,
      bio: char.bio
    }));
    
    res.json(formattedCharacters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
};

const updateAvatar = (req, res) => {
  try {
    const { characterId, avatarUrl } = req.body;
    const success = updateCharacterAvatar(characterId, avatarUrl);
    
    if (success) {
      res.json({ success: true, message: `Avatar updated for character ${characterId}` });
    } else {
      res.status(404).json({ error: 'Character not found' });
    }
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
};

module.exports = {
  getCharacters,
  updateAvatar
};