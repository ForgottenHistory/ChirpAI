const webSocketService = require('../../services/websocketService');

// Start typing sequence with realistic delay
const startTypingSequence = async (conversationId, character) => {
  // Add realistic delay before showing typing indicator (500ms - 1.5s)
  const typingDelay = Math.random() * 1000 + 500;

  return new Promise((resolve) => {
    setTimeout(() => {
      // Start typing indicator
      webSocketService.broadcastTypingStart(
        conversationId,
        character.id,
        character.name
      );
      resolve();
    }, typingDelay);
  });
};

// Stop typing indicator
const stopTyping = (conversationId, character) => {
  webSocketService.broadcastTypingStop(
    conversationId,
    character.id,
    character.name
  );
};

// Start typing indicator immediately (for manual control)
const startTyping = (conversationId, character) => {
  webSocketService.broadcastTypingStart(
    conversationId,
    character.id,
    character.name
  );
};

module.exports = {
  startTypingSequence,
  stopTyping,
  startTyping
};