const fs = require('fs-extra');
const path = require('path');

class ConfigStorageService {
  constructor() {
    this.configDir = path.join(__dirname, '../config');
    this.overridesFile = path.join(this.configDir, 'overrides.json');
    this.overrides = {};
    
    // Ensure config directory exists
    fs.ensureDirSync(this.configDir);
    
    // Load existing overrides
    this.loadOverrides();
  }

  // Load overrides from file
  loadOverrides() {
    try {
      if (fs.existsSync(this.overridesFile)) {
        const data = fs.readFileSync(this.overridesFile, 'utf8');
        this.overrides = JSON.parse(data);
        console.log('[CONFIG_STORAGE] Loaded config overrides from file');
      } else {
        this.overrides = {};
        console.log('[CONFIG_STORAGE] No overrides file found, starting fresh');
      }
    } catch (error) {
      console.error('[CONFIG_STORAGE] Error loading overrides:', error);
      this.overrides = {};
    }
  }

  // Save overrides to file
  saveOverrides() {
    try {
      fs.writeFileSync(this.overridesFile, JSON.stringify(this.overrides, null, 2));
      console.log('[CONFIG_STORAGE] Saved config overrides to file');
      return true;
    } catch (error) {
      console.error('[CONFIG_STORAGE] Error saving overrides:', error);
      return false;
    }
  }

  // Get override value by path
  getOverride(path) {
    const keys = path.split('.');
    let current = this.overrides;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  // Set override value by path
  setOverride(path, value) {
    const keys = path.split('.');
    let current = this.overrides;
    
    // Navigate to the parent of the target key
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Set the final value
    const finalKey = keys[keys.length - 1];
    current[finalKey] = value;
    
    // Save to file immediately
    this.saveOverrides();
    
    console.log(`[CONFIG_STORAGE] Set override ${path}:`, value);
  }

  // Remove override by path
  removeOverride(path) {
    const keys = path.split('.');
    let current = this.overrides;
    const parents = [];
    
    // Navigate to the parent, keeping track of parents
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        return false; // Path doesn't exist
      }
      parents.push({ obj: current, key });
      current = current[key];
    }
    
    const finalKey = keys[keys.length - 1];
    if (finalKey in current) {
      delete current[finalKey];
      
      // Clean up empty parent objects
      for (let i = parents.length - 1; i >= 0; i--) {
        const { obj, key } = parents[i];
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        } else {
          break;
        }
      }
      
      this.saveOverrides();
      console.log(`[CONFIG_STORAGE] Removed override ${path}`);
      return true;
    }
    
    return false;
  }

  // Get all overrides
  getAllOverrides() {
    return JSON.parse(JSON.stringify(this.overrides));
  }

  // Clear all overrides
  clearAllOverrides() {
    this.overrides = {};
    this.saveOverrides();
    console.log('[CONFIG_STORAGE] Cleared all config overrides');
  }

  // Check if override exists
  hasOverride(path) {
    return this.getOverride(path) !== undefined;
  }

  // Apply overrides to a base configuration object
  applyOverrides(baseConfig, overridePath = '') {
    const overrideData = overridePath ? this.getOverride(overridePath) : this.overrides;
    if (!overrideData) return baseConfig;
    
    return this.deepMerge(baseConfig, overrideData);
  }

  // Deep merge utility
  deepMerge(target, source) {
    const result = JSON.parse(JSON.stringify(target)); // Deep clone target
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  // Get backup of current overrides file (for safety)
  createBackup() {
    try {
      if (fs.existsSync(this.overridesFile)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(this.configDir, `overrides.backup.${timestamp}.json`);
        fs.copyFileSync(this.overridesFile, backupFile);
        console.log(`[CONFIG_STORAGE] Created backup: ${backupFile}`);
        return backupFile;
      }
    } catch (error) {
      console.error('[CONFIG_STORAGE] Error creating backup:', error);
    }
    return null;
  }
}

// Create singleton instance
const configStorageService = new ConfigStorageService();

module.exports = configStorageService;