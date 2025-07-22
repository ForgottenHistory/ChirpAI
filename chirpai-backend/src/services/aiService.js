const postGenerator = require('./ai/postGenerator');
const commentGenerator = require('./ai/commentGenerator');
const messageGenerator = require('./ai/messageGenerator');
const configManager = require('./ai/configManager');
const tokenUtils = require('./ai/tokenUtils');
const typingCalculator = require('./ai/typingCalculator');

// Post generation
const generatePost = async (characterId) => {
  return await postGenerator.generatePost(characterId);
};

// Comment generation
const generateComment = async (postContent, commenterCharacterId, originalPosterId, originalPosterName = null, originalPosterType = 'character') => {
  return await commentGenerator.generateComment(
    postContent, 
    commenterCharacterId, 
    originalPosterId, 
    originalPosterName, 
    originalPosterType
  );
};

// Direct message generation
const generateDirectMessage = async (characterId, userName, userMessage, conversationHistory = []) => {
  return await messageGenerator.generateDirectMessage(
    characterId, 
    userName, 
    userMessage, 
    conversationHistory
  );
};

// Configuration management
const getAIConfig = (type) => {
  return configManager.getAIConfig(type);
};

const updateAIConfig = (type, updates) => {
  return configManager.updateAIConfig(type, updates);
};

// Token utilities
const estimateTokens = (text) => {
  return tokenUtils.estimateTokens(text);
};

// Typing calculations
const calculateTypingTime = (messageContent) => {
  return typingCalculator.calculateTypingTime(messageContent);
};

module.exports = {
  generatePost,
  generateComment,
  generateDirectMessage,
  getAIConfig,
  updateAIConfig,
  estimateTokens,
  calculateTypingTime
};