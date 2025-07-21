const {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount
} = require('../services/messageService');
const { getCurrentUser } = require('../services/userService');
const { getCharacterById } = require('../services/characterService');
const { generateDirectMessage } = require('../services/aiService');

// Get all conversations for current user
const getConversations = (req, res) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    const conversations = getUserConversations(currentUser.id);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get or create conversation with a character
const getOrCreateConversationWithCharacter = (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Get messages for a conversation
const getMessages = (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUser = getCurrentUser();

    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    const messages = getConversationMessages(parseInt(conversationId));

    // Mark character messages as read
    markMessagesAsRead(parseInt(conversationId), 'character');

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message
const sendUserMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const currentUser = getCurrentUser();
    const webSocketService = require('../services/websocketService');

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

    // Get conversation details for AI response (async)
    const getConversation = require('../database/db').prepare('SELECT * FROM conversations WHERE id = ?');
    const conversation = getConversation.get(parseInt(conversationId));

    if (conversation) {
      // Get character info for typing indicator
      const character = getCharacterById(conversation.character_id);

      if (character) {
        // Add realistic delay before showing typing indicator (500ms - 1.5s)
        const typingDelay = Math.random() * 1000 + 500;

        setTimeout(async () => {
          // Start typing indicator
          webSocketService.broadcastTypingStart(
            parseInt(conversationId),
            character.id,
            character.name
          );

          try {
            // Generate AI response
            const aiResponse = await generateDirectMessage(
              conversation.character_id,
              currentUser.display_name,
              content.trim(),
              conversationHistory
            );

            // Calculate realistic typing time based on response length
            const { calculateTypingTime } = require('../services/aiService');
            const typingDuration = calculateTypingTime(aiResponse);

            // Show typing for the calculated duration
            setTimeout(() => {
              // Stop typing indicator
              webSocketService.broadcastTypingStop(
                parseInt(conversationId),
                character.id,
                character.name
              );

              // Send AI response
              const aiMessage = sendMessage(
                parseInt(conversationId),
                'character',
                conversation.character_id,
                aiResponse
              );

              // Broadcast the new message
              webSocketService.broadcastNewDirectMessage(aiMessage, conversation, character);

              console.log(`[DM] AI character ${character.name} responded: "${aiResponse}"`);

            }, typingDuration);

          } catch (aiError) {
            console.error('Error generating AI response:', aiError);

            // Make sure to stop typing indicator on error
            webSocketService.broadcastTypingStop(
              parseInt(conversationId),
              character.id,
              character.name
            );
          }
        }, typingDelay);
      }
    }

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get unread message count
const getUnreadCount = (req, res) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }

    const count = getUnreadMessageCount(currentUser.id);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
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