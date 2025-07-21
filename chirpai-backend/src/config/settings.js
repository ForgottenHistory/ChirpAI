const config = require('config');
const fs = require('fs');
const path = require('path');

class Settings {
  constructor() {
    this.config = config;
    this.configPath = path.join(__dirname, '../../config/default.json');
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

  // AI settings
  get ai() {
    return this.config.get('ai');
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

  // Get all settings
  getAll() {
    return this.config.util.toObject();
  }

  // Update settings (runtime only - doesn't persist to file)
  updateRuntime(path, value) {
    this.config.util.setModuleDefaults('runtime', { [path]: value });
    console.log(`[CONFIG] Updated runtime setting ${path} = ${value}`);
  }

  // Get a specific setting by dot notation path
  get(path) {
    return this.config.get(path);
  }

  // Check if a setting exists
  has(path) {
    return this.config.has(path);
  }

  // Save current config to file (for persistence)
  saveToFile() {
    try {
      const currentConfig = this.getAll();
      fs.writeFileSync(this.configPath, JSON.stringify(currentConfig, null, 2));
      console.log('[CONFIG] Configuration saved to file');
      return true;
    } catch (error) {
      console.error('[CONFIG] Error saving configuration:', error);
      return false;
    }
  }

  // Reload config from file
  reloadFromFile() {
    try {
      delete require.cache[require.resolve('config')];
      this.config = require('config');
      console.log('[CONFIG] Configuration reloaded from file');
      return true;
    } catch (error) {
      console.error('[CONFIG] Error reloading configuration:', error);
      return false;
    }
  }

  // Get configuration for display (with descriptions)
  getConfigWithDescriptions() {
    return {
      scheduler: {
        posting: {
          minPostInterval: {
            value: this.posting.minPostInterval,
            description: "Minimum minutes between automatic posts",
            type: "number",
            min: 1,
            max: 60
          },
          maxPostInterval: {
            value: this.posting.maxPostInterval,
            description: "Maximum minutes between automatic posts",
            type: "number", 
            min: 1,
            max: 120
          },
          minCommentInterval: {
            value: this.posting.minCommentInterval,
            description: "Minimum minutes between automatic comments",
            type: "number",
            min: 1,
            max: 30
          },
          maxCommentInterval: {
            value: this.posting.maxCommentInterval,
            description: "Maximum minutes between automatic comments", 
            type: "number",
            min: 1,
            max: 60
          }
        },
        chances: {
          imagePostChance: {
            value: this.chances.imagePostChance,
            description: "Chance (0.0-1.0) that automatic posts include images",
            type: "number",
            min: 0,
            max: 1,
            step: 0.1
          },
          commentChance: {
            value: this.chances.commentChance,
            description: "Chance (0.0-1.0) that AI will comment on posts",
            type: "number", 
            min: 0,
            max: 1,
            step: 0.1
          }
        }
      },
      rateLimit: {
        minDelay: {
          value: this.rateLimit.minDelay,
          description: "Minimum milliseconds between AI API requests",
          type: "number",
          min: 1000,
          max: 10000
        }
      },
      ai: {
        model: {
          value: this.ai.model,
          description: "AI model to use for text generation",
          type: "string"
        },
        maxTokensPost: {
          value: this.ai.maxTokensPost,
          description: "Maximum tokens for post generation",
          type: "number",
          min: 50,
          max: 500
        },
        maxTokensComment: {
          value: this.ai.maxTokensComment,
          description: "Maximum tokens for comment generation", 
          type: "number",
          min: 20,
          max: 200
        }
      }
    };
  }
}

// Create singleton instance
const settings = new Settings();

module.exports = settings;