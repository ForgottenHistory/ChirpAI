const config = require('config');
const fs = require('fs');
const path = require('path');

class Settings {
  constructor() {
    this.config = config;
    this.configPath = path.join(__dirname, '../../config/default.json');
    
    // Runtime overrides - stored in memory
    this.runtimeOverrides = {};
    
    console.log('[CONFIG] Settings initialized');
  }

  // Scheduler settings
  get scheduler() {
    return this.config.get('scheduler');
  }

  get posting() {
    return this.config.get('scheduler.posting');
  }

  get chances() {
    return this.config.get('scheduler.chances');
  }

  // Rate limiting settings
  get rateLimit() {
    return this.config.get('rateLimit');
  }

  // AI settings with runtime overrides
  get ai() {
    const baseAI = this.config.get('ai');
    
    // Apply runtime overrides
    const result = JSON.parse(JSON.stringify(baseAI)); // Deep clone
    
    if (this.runtimeOverrides.ai) {
      for (const [type, overrides] of Object.entries(this.runtimeOverrides.ai)) {
        if (result[type]) {
          result[type] = { ...result[type], ...overrides };
        }
      }
    }
    
    return result;
  }

  // Image generation settings
  get imageGeneration() {
    return this.config.get('imageGeneration');
  }

  get automatic1111Url() {
    return this.config.get('imageGeneration.automatic1111Url');
  }

  get defaultImageSettings() {
    return this.config.get('imageGeneration.defaultSettings');
  }

  get avatarSettings() {
    return this.config.get('imageGeneration.avatarSettings');
  }

  // Server settings
  get server() {
    return this.config.get('server');
  }

  get port() {
    return this.config.get('server.port');
  }

  get imageUrl() {
    return this.config.get('server.imageUrl');
  }

  // Get all settings with runtime overrides applied
  getAll() {
    const base = this.config.util.toObject();
    
    // Apply runtime overrides
    if (this.runtimeOverrides.ai) {
      for (const [type, overrides] of Object.entries(this.runtimeOverrides.ai)) {
        if (base.ai && base.ai[type]) {
          base.ai[type] = { ...base.ai[type], ...overrides };
        }
      }
    }
    
    return base;
  }

  // Update settings (runtime only)
  updateRuntime(path, value) {
    console.log(`[CONFIG] Updating runtime setting ${path}`);
    
    // Handle AI config updates specifically
    if (path.startsWith('ai.')) {
      const [, type] = path.split('.');
      
      if (!this.runtimeOverrides.ai) {
        this.runtimeOverrides.ai = {};
      }
      
      this.runtimeOverrides.ai[type] = value;
      console.log(`[CONFIG] Runtime override set for ai.${type}`);
      return;
    }
    
    // For other paths, you could implement similar logic
    console.log(`[CONFIG] Runtime update for ${path} not implemented yet`);
  }

  // Get a specific setting by dot notation path with overrides
  get(path) {
    // Handle AI settings specially
    if (path.startsWith('ai.')) {
      const [, type, ...rest] = path.split('.');
      const aiConfig = this.ai;
      
      if (rest.length === 0) {
        return aiConfig[type];
      } else {
        const property = rest.join('.');
        return this.getNestedProperty(aiConfig[type], property);
      }
    }
    
    return this.config.get(path);
  }

  // Helper to get nested properties
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  // Check if a setting exists
  has(path) {
    try {
      this.get(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Save current config to file (for persistence)
  saveToFile() {
    try {
      const currentConfig = this.getAll();
      fs.writeFileSync(this.configPath, JSON.stringify(currentConfig, null, 2));
      console.log('[CONFIG] Configuration saved to file');
      
      // Clear runtime overrides since they're now persisted
      this.runtimeOverrides = {};
      
      return true;
    } catch (error) {
      console.error('[CONFIG] Error saving configuration:', error);
      return false;
    }
  }

  // Reload config from file
  reloadFromFile() {
    try {
      // Clear runtime overrides
      this.runtimeOverrides = {};
      
      delete require.cache[require.resolve('config')];
      this.config = require('config');
      console.log('[CONFIG] Configuration reloaded from file');
      return true;
    } catch (error) {
      console.error('[CONFIG] Error reloading configuration:', error);
      return false;
    }
  }

  // Clear runtime overrides
  clearRuntimeOverrides() {
    this.runtimeOverrides = {};
    console.log('[CONFIG] Runtime overrides cleared');
  }

  // Get runtime overrides (for debugging)
  getRuntimeOverrides() {
    return JSON.parse(JSON.stringify(this.runtimeOverrides));
  }
}

// Create singleton instance
const settings = new Settings();

module.exports = settings;