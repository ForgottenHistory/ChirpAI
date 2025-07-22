const variationDatabaseService = require('./variations/variationDatabaseService');
const variationContextService = require('./variations/variationContextService');
const variationGeneratorService = require('./variations/variationGeneratorService');

class MessageVariationService {
  constructor() {
    // Initialize database on startup
    setTimeout(() => {
      this.initializeExistingMessages();
    }, 2000);
  }

  // Generate a new variation for a message
  async generateVariation(messageId, userId, characterId) {
    return await variationGeneratorService.generateVariation(messageId, userId, characterId);
  }

  // Get all variations for a message
  getVariations(messageId) {
    return variationDatabaseService.getVariations(messageId);
  }

  // Get specific variation by index
  getVariation(messageId, index) {
    return variationDatabaseService.getVariation(messageId, index);
  }

  // Clear all variations for a message
  clearVariations(messageId) {
    return variationDatabaseService.clearVariations(messageId);
  }

  // Get variation count
  getVariationCount(messageId) {
    return variationDatabaseService.getVariationCount(messageId);
  }

  // Regenerate message (clear and create new)
  async regenerateMessage(messageId, userId, characterId) {
    return await variationGeneratorService.regenerateMessage(messageId, userId, characterId);
  }

  // Get variation content as array for frontend compatibility
  getVariationContents(messageId) {
    return variationDatabaseService.getVariationContents(messageId);
  }

  // Initialize existing messages with original variations
  initializeExistingMessages() {
    variationDatabaseService.initializeExistingMessages();
  }

  // Future functionality methods (placeholders for easy extension)
  async continueMessage(messageId, userId, characterId) {
    return await variationGeneratorService.continueMessage(messageId, userId, characterId);
  }

  async summarizeMessage(messageId, userId, characterId) {
    return await variationGeneratorService.summarizeMessage(messageId, userId, characterId);
  }

  async changeMessageTone(messageId, userId, characterId, tone) {
    return await variationGeneratorService.changeMessageTone(messageId, userId, characterId, tone);
  }
}

// Create singleton instance
const messageVariationService = new MessageVariationService();

module.exports = messageVariationService;