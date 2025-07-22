const {
  getOrCreateConversation,
  getUserConversations
} = require('../../services/messageService');
const { getCurrentUser } = require('../../services/userService');
const { getCharacterById } = require('../../services/characterService');

// Get all conversations for current user
const getUserConversationsHandler = (req, res) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return res.status(401).json({ error: 'No user logged in' });
  }

  const conversations = getUserConversations(currentUser.id);
  res.json(conversations);
};

// Get or create conversation with a character
const getOrCreateWithCharacter = (req, res) => {
  const { characterId } = req.params;
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return res.status(401).json({ error: 'No user logged in' });
  }

  const character = getCharacterById(parseInt(characterId));
  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }

  const conversation = getOrCreateConversation(currentUser.id, parseInt(characterId));

  res.json({
    ...conversation,
    character: {
      id: character.id,
      username: character.username,
      name: character.name,
      avatar: character.avatar
    }
  });
};

module.exports = {
  getUserConversations: getUserConversationsHandler,
  getOrCreateWithCharacter
};