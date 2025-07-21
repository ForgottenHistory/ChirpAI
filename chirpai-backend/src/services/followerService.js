const db = require('../database/db');
const webSocketService = require('./websocketService');

class FollowerService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.config = {
      updateInterval: 60, // minutes
      maxFollowerChange: 15, // max followers gained/lost per update
      maxFollowingChange: 5,  // max following gained/lost per update
      fluctuationChance: 0.7  // 70% chance of change per update
    };
  }

  start() {
    if (this.isRunning) {
      console.log('[FOLLOWER_SERVICE] Already running');
      return;
    }

    this.isRunning = true;
    console.log(`[FOLLOWER_SERVICE] Starting follower fluctuation every ${this.config.updateInterval} minutes`);
    
    // Convert minutes to milliseconds
    const intervalMs = this.config.updateInterval * 60 * 1000;
    
    this.interval = setInterval(() => {
      this.updateFollowerCounts();
    }, intervalMs);

    console.log('[FOLLOWER_SERVICE] Follower fluctuation service started');
  }

  stop() {
    if (!this.isRunning) {
      console.log('[FOLLOWER_SERVICE] Not running');
      return;
    }

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    console.log('[FOLLOWER_SERVICE] Follower fluctuation service stopped');
  }

  updateFollowerCounts() {
    try {
      console.log('[FOLLOWER_SERVICE] Updating follower counts...');
      
      const characters = this.getAllCharacters();
      const updates = [];

      characters.forEach(character => {
        // Check if this character should have a change
        if (Math.random() > this.config.fluctuationChance) {
          return; // Skip this character this time
        }

        const followerChange = this.calculateChange(this.config.maxFollowerChange);
        const followingChange = this.calculateChange(this.config.maxFollowingChange);

        const newFollowerCount = Math.max(0, character.followers_count + followerChange);
        const newFollowingCount = Math.max(0, character.following_count + followingChange);

        // Update database
        this.updateCharacterCounts(character.id, newFollowerCount, newFollowingCount);

        updates.push({
          characterId: character.id,
          username: character.username,
          oldFollowers: character.followers_count,
          newFollowers: newFollowerCount,
          followerChange,
          oldFollowing: character.following_count,
          newFollowing: newFollowingCount,
          followingChange
        });

        console.log(`[FOLLOWER_SERVICE] ${character.username}: ${character.followers_count} → ${newFollowerCount} followers (${followerChange > 0 ? '+' : ''}${followerChange}), ${character.following_count} → ${newFollowingCount} following (${followingChange > 0 ? '+' : ''}${followingChange})`);
      });

      // Broadcast updates via WebSocket
      if (updates.length > 0) {
        webSocketService.broadcastFollowerUpdates(updates);
      }

    } catch (error) {
      console.error('[FOLLOWER_SERVICE] Error updating follower counts:', error);
    }
  }

  calculateChange(maxChange) {
    // Generate a change between -maxChange and +maxChange
    // Bias slightly towards growth (55% chance of positive change)
    const isPositive = Math.random() < 0.55;
    const magnitude = Math.floor(Math.random() * maxChange) + 1;
    return isPositive ? magnitude : -magnitude;
  }

  getAllCharacters() {
    const stmt = db.prepare('SELECT * FROM characters ORDER BY id ASC');
    return stmt.all();
  }

  updateCharacterCounts(characterId, followersCount, followingCount) {
    const stmt = db.prepare(`
      UPDATE characters 
      SET followers_count = ?, following_count = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    return stmt.run(followersCount, followingCount, characterId);
  }

  getCharacterCounts(characterId) {
    const stmt = db.prepare('SELECT followers_count, following_count FROM characters WHERE id = ?');
    return stmt.get(characterId);
  }

  // Manual trigger for testing
  triggerUpdate() {
    this.updateFollowerCounts();
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[FOLLOWER_SERVICE] Configuration updated:', this.config);
    
    // Restart with new interval if running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      nextUpdate: this.interval ? new Date(Date.now() + this.config.updateInterval * 60 * 1000) : null
    };
  }

  // Format follower count for display (1.2k, 1.5k, etc.)
  static formatCount(count) {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  }
}

// Create singleton instance
const followerService = new FollowerService();

module.exports = followerService;