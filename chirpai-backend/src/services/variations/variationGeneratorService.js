const { generateDirectMessage } = require('../aiService');
const variationContextService = require('./variationContextService');
const variationDatabaseService = require('./variationDatabaseService');

class VariationGeneratorService {
  // Generate a new variation for a message
  async generateVariation(messageId, userId, characterId) {
    try {
      // Get message context and validate permissions
      const { originalMessage, history } = await variationContextService.getMessageContext(messageId, userId);
      const { character, user } = await variationContextService.getParticipants(characterId, userId);

      // Ensure original message is stored as variation
      variationDatabaseService.insertOriginalVariation(messageId, originalMessage.content);

      // Get user prompt from history
      const userContent = variationContextService.getUserPrompt(history);

      // Generate new variation using AI
      const newVariation = await generateDirectMessage(
        characterId,
        user.display_name,
        userContent,
        history
      );

      // Get next available index and store the variation
      const nextIndex = variationDatabaseService.getNextVariationIndex(messageId);
      const result = variationDatabaseService.insertVariation(messageId, nextIndex, newVariation, false);

      console.log(`[VARIATION] Generated variation for message ${messageId}: "${newVariation}"`);

      return {
        id: result.lastInsertRowid,
        messageId,
        variation: newVariation,
        variationIndex: nextIndex,
        totalVariations: nextIndex + 1
      };

    } catch (error) {
      console.error(`[VARIATION] Error generating variation for message ${messageId}:`, error);
      throw error;
    }
  }

  // Regenerate message (clear and create new)
  async regenerateMessage(messageId, userId, characterId) {
    try {
      // Validate permissions
      variationContextService.validateMessagePermissions(messageId, userId, 'character');

      // Clear existing variations
      variationDatabaseService.clearVariations(messageId);

      // Get context for regeneration
      const { history } = await variationContextService.getMessageContext(messageId, userId);
      const { character, user } = await variationContextService.getParticipants(characterId, userId);

      // Get user prompt
      const userContent = variationContextService.getUserPrompt(history);

      // Generate completely new response
      const newVariation = await generateDirectMessage(
        characterId,
        user.display_name,
        userContent,
        history
      );

      // Store as the new original (index 0)
      const result = variationDatabaseService.insertVariation(messageId, 0, newVariation, true);

      console.log(`[VARIATION] Regenerated message ${messageId}`);

      return {
        id: result.lastInsertRowid,
        messageId,
        variation: newVariation,
        variationIndex: 0,
        totalVariations: 1
      };

    } catch (error) {
      console.error(`[VARIATION] Error regenerating message ${messageId}:`, error);
      throw error;
    }
  }

  // Future: Continue message functionality
  async continueMessage(messageId, userId, characterId) {
    try {
      // This would extend the current message with additional content
      // Implementation would be similar to generateVariation but with different prompt
      throw new Error('Continue functionality not yet implemented');
    } catch (error) {
      console.error(`[VARIATION] Error continuing message ${messageId}:`, error);
      throw error;
    }
  }

  // Future: Summarize message functionality
  async summarizeMessage(messageId, userId, characterId) {
    try {
      // This would create a shorter version of the message
      throw new Error('Summarize functionality not yet implemented');
    } catch (error) {
      console.error(`[VARIATION] Error summarizing message ${messageId}:`, error);
      throw error;
    }
  }

  // Future: Change tone functionality
  async changeMessageTone(messageId, userId, characterId, tone) {
    try {
      // This would regenerate the message with a different tone (formal, casual, etc.)
      throw new Error('Change tone functionality not yet implemented');
    } catch (error) {
      console.error(`[VARIATION] Error changing tone for message ${messageId}:`, error);
      throw error;
    }
  }
}

module.exports = new VariationGeneratorService();