const express = require('express');
const router = express.Router();
const {
  getAllAIConfigs,
  getAIConfigByType,
  updateAIConfigByType,
  resetAIConfigByType,
  searchAvailableModels,
  getModelCategories,
  clearModelsCache,
  exportConfig,
  getCurrentOverrides,
  resetAllSettings
} = require('../controllers/aiSettingsController');

// Get all AI configurations
router.get('/ai-settings', getAllAIConfigs);

// Search available models with pagination
router.get('/ai-settings/models/search', searchAvailableModels);

// Get model categories
router.get('/ai-settings/models/categories', getModelCategories);

// Clear models cache (admin endpoint)
router.post('/ai-settings/models/clear-cache', clearModelsCache);

// Get specific AI configuration by type
router.get('/ai-settings/:type', getAIConfigByType);

// Update specific AI configuration by type
router.put('/ai-settings/:type', updateAIConfigByType);

// Reset specific AI configuration to defaults
router.post('/ai-settings/:type/reset', resetAIConfigByType);

// Export configuration (download)
router.get('/ai-settings/export', exportConfig);

// Get current overrides
router.get('/ai-settings/overrides', getCurrentOverrides);

// Reset all settings to defaults
router.post('/ai-settings/reset-all', resetAllSettings);

module.exports = router;