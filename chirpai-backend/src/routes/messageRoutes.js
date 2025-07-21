const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversationWithCharacter,
  getMessages,
  sendUserMessage,
  getUnreadCount
} = require('../controllers/messageController');

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get or create conversation with a specific character
router.get('/conversations/character/:characterId', getOrCreateConversationWithCharacter);

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send a message in a conversation
router.post('/conversations/:conversationId/messages', sendUserMessage);

// Get unread message count
router.get('/messages/unread-count', getUnreadCount);

module.exports = router;