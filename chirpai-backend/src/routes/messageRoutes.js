const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversationWithCharacter,
  getMessages,
  sendUserMessage,
  getUnreadCount,
  variationOperations
} = require('../controllers/messageController');

// Existing conversation routes
router.get('/conversations', getConversations);
router.get('/conversations/character/:characterId', getOrCreateConversationWithCharacter);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendUserMessage);
router.get('/messages/unread-count', getUnreadCount);

// New message variation routes for swipe functionality
router.post('/messages/:messageId/variation', variationOperations.generateVariation);
router.post('/messages/:messageId/regenerate', variationOperations.regenerateMessage);
router.post('/messages/:messageId/continue', variationOperations.continueMessage);

module.exports = router;