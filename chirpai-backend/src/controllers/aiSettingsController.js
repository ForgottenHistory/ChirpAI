const { getAIConfig, updateAIConfig } = require('../services/aiService');
const settings = require('../config/settings');
const featherlessService = require('../services/featherlessService');

// Get all AI configurations
const getAllAIConfigs = (req, res) => {
  try {
    const configs = {
      posts: getAIConfig('posts'),
      comments: getAIConfig('comments'),
      messages: getAIConfig('messages')
    };
    
    res.json(configs);
  } catch (error) {
    console.error('Error getting AI configs:', error);
    res.status(500).json({ error: 'Failed to get AI configurations' });
  }
};

// Get specific AI configuration
const getAIConfigByType = (req, res) => {
  try {
    const { type } = req.params;
    const config = getAIConfig(type);
    res.json(config);
  } catch (error) {
    console.error(`Error getting AI config for ${req.params.type}:`, error);
    res.status(400).json({ error: error.message });
  }
};

// Update specific AI configuration
const updateAIConfigByType = (req, res) => {
  try {
    const { type } = req.params;
    const updates = req.body;
    
    // Validate numeric parameters
    const numericParams = ['maxTokens', 'contextTokens', 'temperature', 'minP', 'topP', 'topK', 'repetitionPenalty'];
    for (const param of numericParams) {
      if (updates[param] !== undefined) {
        const value = parseFloat(updates[param]);
        if (isNaN(value)) {
          return res.status(400).json({ error: `Invalid numeric value for ${param}` });
        }
        updates[param] = value;
      }
    }
    
    // Validate ranges
    if (updates.temperature !== undefined && (updates.temperature < 0 || updates.temperature > 2)) {
      return res.status(400).json({ error: 'Temperature must be between 0 and 2' });
    }
    
    if (updates.topP !== undefined && (updates.topP < 0 || updates.topP > 1)) {
      return res.status(400).json({ error: 'Top P must be between 0 and 1' });
    }
    
    if (updates.minP !== undefined && (updates.minP < 0 || updates.minP > 1)) {
      return res.status(400).json({ error: 'Min P must be between 0 and 1' });
    }
    
    if (updates.topK !== undefined && updates.topK < 0) {
      return res.status(400).json({ error: 'Top K must be 0 or greater' });
    }
    
    const updatedConfig = updateAIConfig(type, updates);
    
    res.json({
      success: true,
      message: `Updated ${type} AI configuration`,
      config: updatedConfig
    });
  } catch (error) {
    console.error(`Error updating AI config for ${req.params.type}:`, error);
    res.status(400).json({ error: error.message });
  }
};

// Reset AI configuration to defaults
const resetAIConfigByType = (req, res) => {
  try {
    const { type } = req.params;
    
    // Get default configuration from the original config file
    const defaultConfigs = {
      posts: {
        model: "meta-llama/llama-3.1-70b-instruct",
        maxTokens: 150,
        contextTokens: 2000,
        temperature: 0.8,
        minP: 0.1,
        topP: 0.9,
        topK: 50,
        repetitionPenalty: 1.05,
        systemPrompt: "You are a helpful assistant that generates social media posts for AI characters. Create engaging, authentic posts that match each character's personality."
      },
      comments: {
        model: "meta-llama/llama-3.1-70b-instruct",
        maxTokens: 100,
        contextTokens: 1500,
        temperature: 0.7,
        minP: 0.08,
        topP: 0.85,
        topK: 40,
        repetitionPenalty: 1.02,
        systemPrompt: "You are a helpful assistant that generates social media comments for AI characters. Create supportive, engaging responses that stay in character."
      },
      messages: {
        model: "meta-llama/llama-3.1-70b-instruct",
        maxTokens: 200,
        contextTokens: 4000,
        temperature: 0.9,
        minP: 0.12,
        topP: 0.92,
        topK: 60,
        repetitionPenalty: 1.08,
        systemPrompt: "You are a helpful assistant that generates direct messages for AI characters. You have access to conversation history to provide contextual, personal responses. Be conversational and natural."
      }
    };
    
    const defaultConfig = defaultConfigs[type];
    if (!defaultConfig) {
      return res.status(400).json({ error: 'Invalid configuration type' });
    }
    
    const updatedConfig = updateAIConfig(type, defaultConfig);
    
    res.json({
      success: true,
      message: `Reset ${type} AI configuration to defaults`,
      config: updatedConfig
    });
  } catch (error) {
    console.error(`Error resetting AI config for ${req.params.type}:`, error);
    res.status(500).json({ error: 'Failed to reset AI configuration' });
  }
};

// Get available models from Featherless API with search and pagination
const searchAvailableModels = async (req, res) => {
  try {
    const { 
      q: query = '', 
      page = 1, 
      pageSize = 20 
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const pageSizeNum = Math.min(parseInt(pageSize) || 20, 50); // Limit max page size
    
    // Fetch all models from Featherless
    const allModels = await featherlessService.fetchModels();
    
    // Search and paginate
    const result = featherlessService.searchModels(allModels, query, pageNum, pageSizeNum);
    
    res.json(result);
  } catch (error) {
    console.error('Error searching available models:', error);
    res.status(500).json({ error: 'Failed to fetch available models' });
  }
};

// Get model categories for filtering
const getModelCategories = async (req, res) => {
  try {
    const allModels = await featherlessService.fetchModels();
    
    // Get unique categories with counts
    const categories = allModels.reduce((acc, model) => {
      const category = model.category;
      if (!acc[category]) {
        acc[category] = { name: category, count: 0 };
      }
      acc[category].count++;
      return acc;
    }, {});

    const sortedCategories = Object.values(categories).sort((a, b) => b.count - a.count);
    
    res.json(sortedCategories);
  } catch (error) {
    console.error('Error getting model categories:', error);
    res.status(500).json({ error: 'Failed to get model categories' });
  }
};

// Clear models cache (for admin use)
const clearModelsCache = (req, res) => {
  try {
    featherlessService.clearCache();
    res.json({ success: true, message: 'Models cache cleared' });
  } catch (error) {
    console.error('Error clearing models cache:', error);
    res.status(500).json({ error: 'Failed to clear models cache' });
  }
};

module.exports = {
  getAllAIConfigs,
  getAIConfigByType,
  updateAIConfigByType,
  resetAIConfigByType,
  searchAvailableModels,
  getModelCategories,
  clearModelsCache
};