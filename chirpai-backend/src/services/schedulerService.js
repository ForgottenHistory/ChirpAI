const { createPost: createPostInDB } = require('./postService');
const { createComment: createCommentInDB } = require('./commentService');
const { generatePost, generateComment } = require('./aiService');
const { generateImage } = require('./imageService');
const { getAllCharacters, getCharacterById } = require('./characterService');
const { getAllPosts } = require('./postService');
const settings = require('../config/settings');
const webSocketService = require('./websocketService');

class SchedulerService {
  constructor() {
    this.isRunning = false;
    this.intervals = [];
    // Load config from settings
    this.config = settings.scheduler;
  }

  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    // Reload config from settings
    this.config = settings.scheduler;
    this.isRunning = true;
    console.log('[SCHEDULER] Starting automatic posting system...');
    console.log('[SCHEDULER] Config:', this.config);
    
    // Schedule post generation
    this.scheduleNextPost();
    
    // Schedule comment generation
    this.scheduleNextComment();
    
    console.log('[SCHEDULER] Automatic posting system started!');
    
    // Broadcast status update
    webSocketService.broadcastSchedulerStatus(this.getStatus());
  }

  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    this.isRunning = false;
    
    // Clear all intervals
    this.intervals.forEach(interval => clearTimeout(interval));
    this.intervals = [];
    
    console.log('[SCHEDULER] Automatic posting system stopped');
    
    // Broadcast status update
    webSocketService.broadcastSchedulerStatus(this.getStatus());
  }

  scheduleNextPost() {
    if (!this.isRunning) return;

    const delay = this.getRandomInterval(
      this.config.posting.minPostInterval,
      this.config.posting.maxPostInterval
    );

    console.log(`[SCHEDULER] Next post scheduled in ${delay / 1000 / 60} minutes`);

    const timeout = setTimeout(async () => {
      await this.generateAutomaticPost();
      this.scheduleNextPost(); // Schedule the next post
    }, delay);

    this.intervals.push(timeout);
  }

  scheduleNextComment() {
    if (!this.isRunning) return;

    const delay = this.getRandomInterval(
      this.config.posting.minCommentInterval,
      this.config.posting.maxCommentInterval
    );

    const timeout = setTimeout(async () => {
      await this.generateAutomaticComment();
      this.scheduleNextComment(); // Schedule the next comment
    }, delay);

    this.intervals.push(timeout);
  }

  async generateAutomaticPost() {
    try {
      // Pick a random character
      const characters = getAllCharacters();
      const randomCharacter = characters[Math.floor(Math.random() * characters.length)];
      
      console.log(`[SCHEDULER] Generating automatic post for ${randomCharacter.name}`);
      
      // Generate post content
      const postContent = await generatePost(randomCharacter.id);
      
      // Decide if this post should have an image
      const includeImage = Math.random() < this.config.chances.imagePostChance;
      let imageUrl = null;
      
      if (includeImage) {
        try {
          console.log(`[SCHEDULER] Generating image for ${randomCharacter.name}'s post`);
          const imageResult = await generateImage(randomCharacter.id, postContent);
          imageUrl = imageResult.imageUrl;
        } catch (imageError) {
          console.error('[SCHEDULER] Image generation failed:', imageError.message);
        }
      }
      
      // Save to database
      const dbPost = createPostInDB(randomCharacter.id, postContent, imageUrl);
      
      console.log(`[SCHEDULER] ✅ Posted by ${randomCharacter.name}: "${postContent.substring(0, 50)}..."`);
      
      // Broadcast to connected clients
      this.broadcastNewPost(dbPost, randomCharacter);
      
    } catch (error) {
      console.error('[SCHEDULER] Error generating automatic post:', error);
    }
  }

  async generateAutomaticComment() {
    try {
      // Get recent posts (last 10 posts)
      const posts = getAllPosts().slice(0, 10);
      
      if (posts.length === 0) {
        console.log('[SCHEDULER] No posts available for commenting');
        return;
      }

      // Decide whether to comment (based on chance)
      if (Math.random() > this.config.chances.commentChance) {
        return; // Skip this comment cycle
      }

      // Pick a random recent post
      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      
      // Pick a character different from the post author
      const characters = getAllCharacters();
      const availableCommenters = characters.filter(char => char.id !== randomPost.userId);
      
      if (availableCommenters.length === 0) {
        return; // No one available to comment
      }
      
      const commenter = availableCommenters[Math.floor(Math.random() * availableCommenters.length)];
      
      console.log(`[SCHEDULER] ${commenter.name} is commenting on post ${randomPost.id}`);
      
      // Generate comment
      const commentContent = await generateComment(
        randomPost.content,
        commenter.id,
        randomPost.userId
      );
      
      // Save to database
      const dbComment = createCommentInDB(randomPost.id, commenter.id, commentContent);
      
      console.log(`[SCHEDULER] 💬 ${commenter.name} commented: "${commentContent}"`);
      
      // Broadcast to connected clients
      this.broadcastNewComment(dbComment, commenter, randomPost.id);
      
    } catch (error) {
      console.error('[SCHEDULER] Error generating automatic comment:', error);
    }
  }

  // Helper method to get random interval in milliseconds
  getRandomInterval(minMinutes, maxMinutes) {
    const min = minMinutes * 60 * 1000; // Convert to milliseconds
    const max = maxMinutes * 60 * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Broadcast new post via WebSocket
  broadcastNewPost(post, character) {
    webSocketService.broadcastNewPost(post, character);
  }

  // Broadcast new comment via WebSocket
  broadcastNewComment(comment, character, postId) {
    webSocketService.broadcastNewComment(comment, character, postId);
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      activeIntervals: this.intervals.length
    };
  }

  // Update configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[SCHEDULER] Configuration updated:', this.config);
  }

  // Reload config from file
  reloadConfig() {
    this.config = settings.scheduler;
    console.log('[SCHEDULER] Configuration reloaded from file');
  }
}

// Create singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;