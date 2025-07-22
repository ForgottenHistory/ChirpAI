const conversationHandler = require('./message/conversationHandler');
const messageHandler = require('./message/messageHandler');
const aiResponseHandler = require('./message/aiResponseHandler');

// Get all conversations for current user
const getConversations = (req, res) => {
  try {
    conversationHandler.getUserConversations(req, res);
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get or create conversation with a character
const getOrCreateConversationWithCharacter = (req, res) => {
  try {
    conversationHandler.getOrCreateWithCharacter(req, res);
  } catch (error) {
    console.error('Error in getOrCreateConversationWithCharacter:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Get messages for a conversation
const getMessages = (req, res) => {
  try {
    messageHandler.getConversationMessages(req, res);
  } catch (error) {
    console.error('Error in getMessages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message
const sendUserMessage = async (req, res) => {
  try {
    await messageHandler.sendUserMessage(req, res);
  } catch (error) {
    console.error('Error in sendUserMessage:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get unread message count
const getUnreadCount = (req, res) => {
  try {
    messageHandler.getUnreadCount(req, res);
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

module.exports = {
  getConversations,
  getOrCreateConversationWithCharacter,
  getMessages,
  sendUserMessage,
  getUnreadCount
};