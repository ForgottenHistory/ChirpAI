const settings = require('../../config/settings');

// Get current AI configuration for a specific type
const getAIConfig = (type) => {
  const validTypes = ['posts', 'comments', 'messages'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid AI config type. Must be one of: ${validTypes.join(', ')}`);
  }
  return settings.ai[type];
};

// Update AI configuration for a specific type
const updateAIConfig = (type, updates) => {
  const validTypes = ['posts', 'comments', 'messages'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid AI config type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  const currentConfig = settings.ai[type];
  const newConfig = { ...currentConfig, ...updates };
  
  // Update the settings using the new runtime system
  settings.updateRuntime(`ai.${type}`, newConfig);
  
  console.log(`[AI_CONFIG] Updated ${type} configuration:`, updates);
  return newConfig;
};

// Validate AI configuration parameters
const validateConfig = (config) => {
  const errors = [];
  
  // Temperature validation
  if (config.temperature !== undefined) {
    if (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 2) {
      errors.push('Temperature must be a number between 0 and 2');
    }
  }
  
  // Top P validation
  if (config.topP !== undefined) {
    if (typeof config.topP !== 'number' || config.topP < 0 || config.topP > 1) {
      errors.push('Top P must be a number between 0 and 1');
    }
  }
  
  // Min P validation
  if (config.minP !== undefined) {
    if (typeof config.minP !== 'number' || config.minP < 0 || config.minP > 1) {
      errors.push('Min P must be a number between 0 and 1');
    }
  }
  
  // Top K validation
  if (config.topK !== undefined) {
    if (typeof config.topK !== 'number' || config.topK < 0) {
      errors.push('Top K must be a number >= 0');
    }
  }
  
  // Max tokens validation
  if (config.maxTokens !== undefined) {
    if (typeof config.maxTokens !== 'number' || config.maxTokens < 1) {
      errors.push('Max tokens must be a positive number');
    }
  }
  
  return errors;
};

module.exports = {
  getAIConfig,
  updateAIConfig,
  validateConfig
};