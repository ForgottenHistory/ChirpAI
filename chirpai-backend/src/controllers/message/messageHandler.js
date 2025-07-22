const {
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount
} = require('../../services/messageService');
const { getCurrentUser } = require('../../services/userService');
const aiResponseHandler = require('./aiResponseHandler');

// Get messages for a conversation
const getConversationMessagesHandler = (req, res) => {
  const { conversationId } = req.params;
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return res.status(401).json({ error: 'No user logged in' });
  }

  const messages = getConversationMessages(parseInt(conversationId));

  // Mark character messages as read
  markMessagesAsRead(parseInt(conversationId), 'character');

  res.json(messages);
};

// Send a user message
const sendUserMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return res.status(401).json({ error: 'No user logged in' });
  }

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  // Get conversation history for context
  const conversationHistory = getConversationMessages(parseInt(conversationId), 20);

  // Send user message
  const userMessage = sendMessage(
    parseInt(conversationId),
    'user',
    currentUser.id,
    content.trim()
  );

  console.log(`[DM] User ${currentUser.username} sent message: "${content}"`);

  // Return user message immediately
  res.json({ userMessage });

  // Handle AI response asynchronously
  aiResponseHandler.handleAIResponse(
    parseInt(conversationId),
    currentUser,
    content.trim(),
    conversationHistory
  );
};

// Get unread message count
const getUnreadCount = (req, res) => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return res.status(401).json({ error: 'No user logged in' });
  }

  const count = getUnreadMessageCount(currentUser.id);
  res.json({ unreadCount: count });
};

module.exports = {
  getConversationMessages: getConversationMessagesHandler,
  sendUserMessage,
  getUnreadCount
};