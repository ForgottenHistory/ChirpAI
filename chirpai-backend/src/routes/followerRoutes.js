const express = require('express');
const router = express.Router();
const followerService = require('../services/followerService');

// Follower service routes
router.post('/followers/start', (req, res) => {
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

router.post('/followers/stop', (req, res) => {
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

router.get('/followers/status', (req, res) => {
  try {
    const status = followerService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting follower service status:', error);
    res.status(500).json({ error: 'Failed to get follower service status' });
  }
});

router.post('/followers/config', (req, res) => {
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

router.post('/followers/trigger', (req, res) => {
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

module.exports = router;