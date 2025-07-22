const express = require('express');
const router = express.Router();
const {
  generateMessageVariation,
  getMessageVariations,
  regenerateMessage
} = require('../controllers/messageVariationController');

// Generate a new variation for a message
router.post('/messages/:messageId/variations', generateMessageVariation);

// Get all variations for a message
router.get('/messages/:messageId/variations', getMessageVariations);

// Regenerate message (clear all variations and create new)
router.post('/messages/:messageId/regenerate', regenerateMessage);

module.exports = router;