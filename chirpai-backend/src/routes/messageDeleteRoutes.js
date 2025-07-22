const express = require('express');
const router = express.Router();
const {
  deleteMessagesFrom,
  deleteSingleMessage
} = require('../controllers/messageDeleteController');

// Delete messages from a specific point onwards in a conversation
router.delete('/conversations/:conversationId/messages/from/:messageId', deleteMessagesFrom);

// Delete a single message (for future use)
router.delete('/messages/:messageId', deleteSingleMessage);

module.exports = router;