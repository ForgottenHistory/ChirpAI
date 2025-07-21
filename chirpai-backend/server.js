const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import settings first
const settings = require('./src/config/settings');
const webSocketService = require('./src/services/websocketService');

const { getCharacters, updateAvatar } = require('./src/controllers/characterController');
const { createPost, getPosts, toggleLike, createImage } = require('./src/controllers/postController');
const { createComment, getComments } = require('./src/controllers/commentController');
const { startScheduler, stopScheduler, getSchedulerStatus, updateSchedulerConfig } = require('./src/controllers/schedulerController');
const { getSettings, updateSettings, saveSettings, reloadSettings } = require('./src/controllers/settingsController');
const { generateAvatar } = require('./src/services/avatarService');

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Configuration loaded from: config/default.json`);
  console.log(`WebSocket server ready for live updates`);
});