const config = require('config');
const fs = require('fs');
const path = require('path');
const configStorageService = require('../services/configStorageService');

class Settings {
  constructor() {
    this.config = config;
    this.configPath = path.join(__dirname, '../../config/default.json');
    
    console.log('[CONFIG] Settings initialized with persistent storage');
  }

  // Scheduler settings
  get scheduler() {
    const base = this.config.get('scheduler');
    return configStorageService.applyOverrides(base, 'scheduler');
  }

  get posting() {
    const base = this.config.get('scheduler.posting');
    return configStorageService.applyOverrides(base, 'scheduler.posting');
  }

  get chances() {
    const base = this.config.get('scheduler.chances');
    return configStorageService.applyOverrides(base, 'scheduler.chances');
  }

  // Rate limiting settings
  get rateLimit() {
    const base = this.config.get('rateLimit');
    return configStorageService.applyOverrides(base, 'rateLimit');
  }

  // AI settings with persistent overrides
  get ai() {
    const base = this.config.get('ai');
    return configStorageService.applyOverrides(base, 'ai');
  }

  // Image generation settings
  get imageGeneration() {
    const base = this.config.get('imageGeneration');
    return configStorageService.applyOverrides(base, 'imageGeneration');
  }

  get automatic1111Url() {
    return this.get('imageGeneration.automatic1111Url');
  }

  get defaultImageSettings() {
    return this.get('imageGeneration.defaultSettings');
  }

  get avatarSettings() {
    return this.get('imageGeneration.avatarSettings');
  }

  // Server settings
  get server() {
    const base = this.config.get('server');
    return configStorageService.applyOverrides(base, 'server');
  }

  get port() {
    return this.get('server.port');
  }

  get imageUrl() {
    return this.get('server.imageUrl');
  }

  // Get all settings with overrides applied
  getAll() {
    const base = this.config.util.toObject();
    return configStorageService.applyOverrides(base);
  }

  // Update settings (persistent)
  updateRuntime(path, value) {
    console.log(`[CONFIG] Updating persistent setting ${path}`);
    configStorageService.setOverride(path, value);
  }

  // Get a specific setting by dot notation path with overrides
  get(path) {
    // Check if there's an override first
    const override = configStorageService.getOverride(path);
    if (override !== undefined) {
      return override;
    }
    
    // Fall back to base config
    try {
      return this.config.get(path);
    } catch (error) {
      return undefined;
    }
  }

  // Check if a setting exists
  has(path) {
    return configStorageService.hasOverride(path) || this.config.has(path);
  }

  // Remove a setting override (revert to default)
  removeOverride(path) {
    return configStorageService.removeOverride(path);
  }

  // Save current config to the main config file (backup/export)
  saveToFile() {
    try {
      const currentConfig = this.getAll();
      fs.writeFileSync(this.configPath, JSON.stringify(currentConfig, null, 2));
      console.log('[CONFIG] Configuration exported to main config file');
      return true;
    } catch (error) {
      console.error('[CONFIG] Error saving configuration:', error);
      return false;
    }
  }

  // Reload config from file (clears overrides)
  reloadFromFile() {
    try {
      configStorageService.clearAllOverrides();
      
      delete require.cache[require.resolve('config')];
      this.config = require('config');
      console.log('[CONFIG] Configuration reloaded from file, overrides cleared');
      return true;
    } catch (error) {
      console.error('[CONFIG] Error reloading configuration:', error);
      return false;
    }
  }

  // Clear all overrides (revert to defaults)
  clearAllOverrides() {
    configStorageService.clearAllOverrides();
    console.log('[CONFIG] All overrides cleared, reverted to defaults');
  }

  // Get current overrides (for debugging/display)
  getOverrides() {
    return configStorageService.getAllOverrides();
  }

  // Create backup of current overrides
  createBackup() {
    return configStorageService.createBackup();
  }

  // Reset a specific section to defaults
  resetSection(section) {
    const sectionOverrides = configStorageService.getOverride(section);
    if (sectionOverrides) {
      configStorageService.removeOverride(section);
      console.log(`[CONFIG] Reset section ${section} to defaults`);
      return true;
    }
    return false;
  }
}

// Create singleton instance
const settings = new Settings();

module.exports = settings;