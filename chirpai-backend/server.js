const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import settings first
const settings = require('./src/config/settings');
const webSocketService = require('./src/services/websocketService');
const followerService = require('./src/services/followerService');

const { getCharacters, updateAvatar } = require('./src/controllers/characterController');
const { createPost, getPosts, toggleLike, createImage } = require('./src/controllers/postController');
const { createComment, getComments } = require('./src/controllers/commentController');
const { startScheduler, stopScheduler, getSchedulerStatus, updateSchedulerConfig } = require('./src/controllers/schedulerController');
const { getSettings, updateSettings, saveSettings, reloadSettings } = require('./src/controllers/settingsController');
const { generateAvatar } = require('./src/services/avatarService');

const { 
  getUsers, 
  getUser, 
  createNewUser, 
  updateUserProfile, 
  removeUser,
  getSession,
  switchUser,
  toggleAdminMode
} = require('./src/controllers/userController');

const app = express();
const server = http.createServer(app);
const PORT = settings.port || 5000;

// Initialize WebSocket service
webSocketService.initialize(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/avatars', express.static(path.join(__dirname, 'avatars')));

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'ChirpAI backend is running!' });
});

app.get('/api/characters', getCharacters);
app.post('/api/update-avatar', updateAvatar);

// Post routes
app.get('/api/posts', getPosts);
app.post('/api/generate-post', createPost);
app.post('/api/toggle-like', toggleLike);
app.post('/api/generate-image', createImage);

// Comment routes
app.post('/api/generate-comment', createComment);
app.get('/api/comments/:postId', getComments);

// Scheduler routes
app.post('/api/scheduler/start', startScheduler);
app.post('/api/scheduler/stop', stopScheduler);
app.get('/api/scheduler/status', getSchedulerStatus);
app.post('/api/scheduler/config', updateSchedulerConfig);

// Settings routes
app.get('/api/settings', getSettings);
app.post('/api/settings', updateSettings);
app.post('/api/settings/save', saveSettings);
app.post('/api/settings/reload', reloadSettings);

// WebSocket stats route
app.get('/api/websocket/stats', (req, res) => {
  res.json(webSocketService.getStats());
});

// Avatar generation endpoint
app.post('/api/generate-avatar', async (req, res) => {
  try {
    const { characterId } = req.body;
    const result = await generateAvatar(characterId);
    
    // Update the character's avatar in the database
    const { updateCharacterAvatar } = require('./src/services/characterService');
    updateCharacterAvatar(characterId, result.avatarUrl);
    
    res.json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating avatar:`, error);
    res.status(500).json({ error: 'Failed to generate avatar' });
  }
});

app.post('/api/followers/start', (req, res) => {
  try {
    followerService.start();
    res.json({ 
      success: true, 
      message: 'Follower fluctuation service started',
      status: followerService.getStatus()
    });
  } catch (error) {
    console.error('Error starting follower service:', error);
    res.status(500).json({ error: 'Failed to start follower service' });
  }
});

app.post('/api/followers/stop', (req, res) => {
  try {
    followerService.stop();
    res.json({ 
      success: true, 
      message: 'Follower fluctuation service stopped',
      status: followerService.getStatus()
    });
  } catch (error) {
    console.error('Error stopping follower service:', error);
    res.status(500).json({ error: 'Failed to stop follower service' });
  }
});

app.get('/api/followers/status', (req, res) => {
  try {
    const status = followerService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting follower service status:', error);
    res.status(500).json({ error: 'Failed to get follower service status' });
  }
});

app.post('/api/followers/config', (req, res) => {
  try {
    const newConfig = req.body;
    followerService.updateConfig(newConfig);
    res.json({ 
      success: true, 
      message: 'Follower service configuration updated',
      config: followerService.getStatus().config
    });
  } catch (error) {
    console.error('Error updating follower service config:', error);
    res.status(500).json({ error: 'Failed to update follower service config' });
  }
});

app.post('/api/followers/trigger', (req, res) => {
  try {
    followerService.triggerUpdate();
    res.json({ 
      success: true, 
      message: 'Follower update triggered manually'
    });
  } catch (error) {
    console.error('Error triggering follower update:', error);
    res.status(500).json({ error: 'Failed to trigger follower update' });
  }
});

// Debug endpoint to check character data
app.get('/api/debug/characters', (req, res) => {
  try {
    const db = require('./src/database/db');
    const characters = db.prepare('SELECT * FROM characters').all();
    
    console.log('Raw character data from database:', characters);
    
    res.json({
      message: 'Character data from database',
      characters: characters.map(char => ({
        id: char.id,
        username: char.username,
        followers_count: char.followers_count,
        following_count: char.following_count,
        raw: char
      }))
    });
  } catch (error) {
    console.error('Error fetching debug character data:', error);
    res.status(500).json({ error: 'Failed to fetch debug data' });
  }
});

// User post routes
// User post routes
app.post('/api/create-user-post', async (req, res) => {
  try {
    const { content, imageUrl = null } = req.body;
    const { getCurrentUser } = require('./src/services/userService');
    const { createPost } = require('./src/services/postService');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }
    
    console.log(`[USER_POST] Creating post for user ${currentUser.id} (${currentUser.username})`);
    console.log(`[USER_POST] Content: "${content}"`);
    
    // Create post with user_type
    const dbPost = createPost(currentUser.id, content, imageUrl, 'user');
    
    console.log(`[USER_POST] Created post with ID: ${dbPost.id}`);
    console.log(`[USER_POST] Post data:`, {
      id: dbPost.id,
      userId: dbPost.userId,
      user_id: dbPost.user_id,
      user_type: dbPost.user_type,
      content: dbPost.content
    });
    
    res.json({
      id: dbPost.id,
      content: dbPost.content,
      imageUrl: dbPost.imageUrl,
      likes: dbPost.likes || 0,
      userId: currentUser.id, // Keep for compatibility
      user_id: currentUser.id,
      user_type: 'user'
    });
  } catch (error) {
    console.error('Error creating user post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// User management routes
app.get('/api/users', getUsers);
app.get('/api/users/:id', getUser);
app.post('/api/users', createNewUser);
app.put('/api/users/:id', updateUserProfile);
app.delete('/api/users/:id', removeUser);

// Session management routes
app.get('/api/session', getSession);
app.post('/api/session/switch-user', switchUser);
app.post('/api/session/admin-mode', toggleAdminMode);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Configuration loaded from: config/default.json`);
  console.log(`WebSocket server ready for live updates`);
});