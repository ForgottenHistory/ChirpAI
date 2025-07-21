const { Server } = require('socket.io');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`[WEBSOCKET] Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, {
        socket,
        connectedAt: new Date()
      });

      // Handle client disconnect
      socket.on('disconnect', () => {
        console.log(`[WEBSOCKET] Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });

      // Handle client ping for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to ChirpAI live updates',
        clientId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    console.log('[WEBSOCKET] WebSocket server initialized');
  }

  // Broadcast new post to all connected clients
  // Broadcast new post to all connected clients
  broadcastNewPost(post, character) {
    if (!this.io) return;

    const payload = {
      type: 'NEW_POST',
      data: {
        id: post.id,
        userId: post.userId,
        user_id: post.user_id,
        user_type: post.user_type,
        content: post.content,
        imageUrl: post.imageUrl,
        likes: post.likes,
        timestamp: post.timestamp || post.created_at, // Use actual DB timestamp
        character: {
          id: character.id,
          username: character.username,
          name: character.name,
          avatar: character.avatar,
          bio: character.bio
        }
      },
      timestamp: new Date().toISOString()
    };

    this.io.emit('newPost', payload);
    console.log(`[WEBSOCKET] 📡 Broadcasted new post by ${character.name} to ${this.connectedClients.size} clients`);
  }

  // Broadcast new comment to all connected clients
  broadcastNewComment(comment, character, postId) {
    if (!this.io) return;

    const payload = {
      type: 'NEW_COMMENT',
      data: {
        id: comment.id,
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        timestamp: comment.timestamp || comment.created_at, // Use actual DB timestamp
        character: {
          id: character.id,
          username: character.username,
          name: character.name,
          avatar: character.avatar
        }
      },
      timestamp: new Date().toISOString()
    };

    this.io.emit('newComment', payload);
    console.log(`[WEBSOCKET] 📡 Broadcasted new comment by ${character.name} to ${this.connectedClients.size} clients`);
  }

  // Broadcast new comment to all connected clients
  broadcastNewComment(comment, character, postId) {
    if (!this.io) return;

    const payload = {
      type: 'NEW_COMMENT',
      data: {
        id: comment.id,
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        timestamp: 'just now',
        character: {
          id: character.id,
          username: character.username,
          name: character.name,
          avatar: character.avatar
        }
      },
      timestamp: new Date().toISOString()
    };

    this.io.emit('newComment', payload);
    console.log(`[WEBSOCKET] 📡 Broadcasted new comment by ${character.name} to ${this.connectedClients.size} clients`);
  }

  // Broadcast like update
  broadcastLikeUpdate(postId, newLikeCount, userId) {
    if (!this.io) return;

    const payload = {
      type: 'LIKE_UPDATE',
      data: {
        postId,
        likes: newLikeCount,
        userId
      },
      timestamp: new Date().toISOString()
    };

    this.io.emit('likeUpdate', payload);
    console.log(`[WEBSOCKET] 📡 Broadcasted like update for post ${postId}`);
  }

  // Broadcast scheduler status update
  broadcastSchedulerStatus(status) {
    if (!this.io) return;

    const payload = {
      type: 'SCHEDULER_STATUS',
      data: status,
      timestamp: new Date().toISOString()
    };

    this.io.emit('schedulerStatus', payload);
    console.log(`[WEBSOCKET] 📡 Broadcasted scheduler status: ${status.isRunning ? 'running' : 'stopped'}`);
  }

  // Get connection statistics
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      isInitialized: !!this.io
    };
  }

  // Send custom message to all clients
  broadcast(event, data) {
    if (!this.io) return;
    this.io.emit(event, data);
    console.log(`[WEBSOCKET] 📡 Broadcasted ${event} to ${this.connectedClients.size} clients`);
  }

  // Broadcast follower count updates
  broadcastFollowerUpdates(updates) {
    if (!this.io) return;

    const payload = {
      type: 'FOLLOWER_UPDATES',
      data: updates.map(update => ({
        characterId: update.characterId,
        username: update.username,
        followers: update.newFollowers,
        following: update.newFollowing,
        followerChange: update.followerChange,
        followingChange: update.followingChange
      })),
      timestamp: new Date().toISOString()
    };

    this.io.emit('followerUpdates', payload);
    console.log(`[WEBSOCKET] 📡 Broadcasted follower updates for ${updates.length} characters to ${this.connectedClients.size} clients`);
  }

  // Broadcast typing indicator start
  broadcastTypingStart(conversationId, characterId, characterName) {
    if (!this.io) return;

    const payload = {
      type: 'TYPING_START',
      data: {
        conversationId,
        characterId,
        characterName,
        isTyping: true
      },
      timestamp: new Date().toISOString()
    };

    this.io.emit('typingStart', payload);
    console.log(`[WEBSOCKET] 📡 Broadcasting typing start for ${characterName} in conversation ${conversationId}`);
  }

  // Broadcast typing indicator stop
  broadcastTypingStop(conversationId, characterId, characterName) {
    if (!this.io) return;

    const payload = {
      type: 'TYPING_STOP',
      data: {
        conversationId,
        characterId,
        characterName,
        isTyping: false
      },
      timestamp: new Date().toISOString()
    };

    this.io.emit('typingStop', payload);
    console.log(`[WEBSOCKET] 📡 Broadcasting typing stop for ${characterName} in conversation ${conversationId}`);
  }

  // Broadcast new direct message
  broadcastNewDirectMessage(message, conversation, character) {
    if (!this.io) return;

    const payload = {
      type: 'NEW_DIRECT_MESSAGE',
      data: {
        message,
        conversationId: conversation.id,
        character: {
          id: character.id,
          username: character.username,
          name: character.name,
          avatar: character.avatar
        }
      },
      timestamp: new Date().toISOString()
    };

    this.io.emit('newDirectMessage', payload);
    console.log(`[WEBSOCKET] 📡 Broadcasted new direct message from ${character.name}`);
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

module.exports = webSocketService;