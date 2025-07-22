const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import settings and services
const settings = require('./src/config/settings');
const webSocketService = require('./src/services/websocketService');
const followerService = require('./src/services/followerService');

// Import route modules
const characterRoutes = require('./src/routes/characterRoutes');
const postRoutes = require('./src/routes/postRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const schedulerRoutes = require('./src/routes/schedulerRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const followerRoutes = require('./src/routes/followerRoutes');
const userRoutes = require('./src/routes/userRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const imageRoutes = require('./src/routes/imageRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const aiSettingsRoutes = require('./src/routes/aiSettingsRoutes');
const messageVariationRoutes = require('./src/routes/messageVariationRoutes');
const messageDeleteRoutes = require('./src/routes/messageDeleteRoutes');

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

// Health check route
app.get('/api/test', (req, res) => {
  res.json({ message: 'ChirpAI backend is running!' });
});

// API Routes
app.use('/api', characterRoutes);
app.use('/api', postRoutes);
app.use('/api', commentRoutes);
app.use('/api', schedulerRoutes);
app.use('/api', settingsRoutes);
app.use('/api', followerRoutes);
app.use('/api', userRoutes);
app.use('/api', sessionRoutes);
app.use('/api', imageRoutes);
app.use('/api', messageRoutes);
app.use('/api', aiSettingsRoutes);

// WebSocket stats route
app.get('/api/websocket/stats', (req, res) => {
  res.json(webSocketService.getStats());
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Message Variations route
app.use('/api', messageVariationRoutes);
app.use('/api', messageDeleteRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Configuration loaded from: config/default.json`);
  console.log(`WebSocket server ready for live updates`);
});