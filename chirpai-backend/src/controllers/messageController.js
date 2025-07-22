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
const webSocketService = require('../services/websocketService');

// Utility functions
const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const validateUser = (currentUser) => {
  if (!currentUser) {
    throw new Error('No user logged in');
  }
};

const validateMessageContent = (content) => {
  if (!content || !content.trim()) {
    throw new Error('Message content is required');
  }
};

// Core conversation operations
const conversationOperations = {
  async getConversations(req, res) {
    try {
      const currentUser = getCurrentUser();
      validateUser(currentUser);

      const conversations = getUserConversations(currentUser.id);
      res.json(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(error.message === 'No user logged in' ? 401 : 500)
         .json({ error: error.message });
    }
  },

  async getOrCreateConversationWithCharacter(req, res) {
    try {
      const { characterId } = req.params;
      const currentUser = getCurrentUser();
      validateUser(currentUser);

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
      res.status(error.message === 'No user logged in' ? 401 : 500)
         .json({ error: error.message });
    }
  },

  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const currentUser = getCurrentUser();
      validateUser(currentUser);

      const messages = getConversationMessages(parseInt(conversationId));

      // Mark character messages as read
      markMessagesAsRead(parseInt(conversationId), 'character');

      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(error.message === 'No user logged in' ? 401 : 500)
         .json({ error: error.message });
    }
  }
};

// Message sending and AI response handling
const messageOperations = {
  async sendUserMessage(req, res) {
    try {
      const { conversationId } = req.params;
      const { content } = req.body;
      const currentUser = getCurrentUser();

      validateUser(currentUser);
      validateMessageContent(content);

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
      await messageOperations.handleAIResponse(
        parseInt(conversationId),
        content.trim(),
        conversationHistory,
        currentUser
      );

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(error.message === 'No user logged in' ? 401 : 
                error.message === 'Message content is required' ? 400 : 500)
         .json({ error: error.message });
    }
  },

  async handleAIResponse(conversationId, userContent, conversationHistory, currentUser) {
    try {
      // Get conversation details
      const getConversation = require('../database/db').prepare('SELECT * FROM conversations WHERE id = ?');
      const conversation = getConversation.get(conversationId);

      if (!conversation) return;

      const character = getCharacterById(conversation.character_id);
      if (!character) return;

      // Add realistic delay before showing typing indicator
      const typingDelay = Math.random() * 1000 + 500;

      setTimeout(async () => {
        // Start typing indicator
        webSocketService.broadcastTypingStart(
          conversationId,
          character.id,
          character.name
        );

        try {
          // Generate AI response
          const aiResponse = await generateDirectMessage(
            conversation.character_id,
            currentUser.display_name,
            userContent,
            conversationHistory
          );

          // Calculate realistic typing time based on response length
          const { calculateTypingTime } = require('../services/aiService');
          const typingDuration = calculateTypingTime(aiResponse);

          // Show typing for the calculated duration
          setTimeout(() => {
            // Stop typing indicator
            webSocketService.broadcastTypingStop(
              conversationId,
              character.id,
              character.name
            );

            // Send AI response
            const aiMessage = sendMessage(
              conversationId,
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
            conversationId,
            character.id,
            character.name
          );
        }
      }, typingDelay);

    } catch (error) {
      console.error('Error handling AI response:', error);
    }
  }
};

// Utility operations
const utilityOperations = {
  async getUnreadCount(req, res) {
    try {
      const currentUser = getCurrentUser();
      validateUser(currentUser);

      const count = getUnreadMessageCount(currentUser.id);
      res.json({ unreadCount: count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(error.message === 'No user logged in' ? 401 : 500)
         .json({ error: error.message });
    }
  }
};

// Message variation operations (for swipe functionality)
const variationOperations = {
  async generateVariation(req, res) {
    try {
      const { messageId } = req.params;
      const { originalContent } = req.body;
      const currentUser = getCurrentUser();

      validateUser(currentUser);

      // TODO: Implement variation generation logic
      // This would involve re-prompting the AI with slightly different parameters
      // or asking for alternative responses to the same input

      const variations = [
        "That's an interesting perspective! I'd love to hear more about your thoughts on this.",
        "I appreciate you sharing that with me. What made you think about this topic?",
        "That's fascinating! I've been thinking about similar things lately.",
        "Thanks for bringing this up - it's given me a lot to think about.",
        "I find your viewpoint really compelling. How did you come to this conclusion?"
      ];

      const randomVariation = variations[Math.floor(Math.random() * variations.length)];

      res.json({
        messageId: parseInt(messageId),
        variation: randomVariation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating variation:', error);
      res.status(error.message === 'No user logged in' ? 401 : 500)
         .json({ error: error.message });
    }
  },

  async regenerateMessage(req, res) {
    try {
      const { messageId } = req.params;
      const currentUser = getCurrentUser();

      validateUser(currentUser);

      // TODO: Implement message regeneration logic
      // This would clear all existing variations and generate a completely new response

      res.json({
        messageId: parseInt(messageId),
        message: 'Message regeneration not yet implemented',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error regenerating message:', error);
      res.status(error.message === 'No user logged in' ? 401 : 500)
         .json({ error: error.message });
    }
  },

  async continueMessage(req, res) {
    try {
      const { messageId } = req.params;
      const currentUser = getCurrentUser();

      validateUser(currentUser);

      // TODO: Implement message continuation logic
      // This would append to the existing message content

      res.json({
        messageId: parseInt(messageId),
        message: 'Message continuation not yet implemented',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error continuing message:', error);
      res.status(error.message === 'No user logged in' ? 401 : 500)
         .json({ error: error.message });
    }
  }
};

// Export all operations
module.exports = {
  // Existing exports for backward compatibility
  getConversations: conversationOperations.getConversations,
  getOrCreateConversationWithCharacter: conversationOperations.getOrCreateConversationWithCharacter,
  getMessages: conversationOperations.getMessages,
  sendUserMessage: messageOperations.sendUserMessage,
  getUnreadCount: utilityOperations.getUnreadCount,

  // New modular exports
  conversationOperations,
  messageOperations,
  utilityOperations,
  variationOperations,

  // Utility functions
  formatMessageTime,
  validateUser,
  validateMessageContent
};