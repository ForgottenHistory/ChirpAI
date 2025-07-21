const schedulerService = require('../services/schedulerService');
const rateLimitService = require('../services/rateLimitService');

const startScheduler = (req, res) => {
  try {
    schedulerService.start();
    res.json({ 
      success: true, 
      message: 'Automatic posting system started',
      status: schedulerService.getStatus()
    });
  } catch (error) {
    console.error('Error starting scheduler:', error);
    res.status(500).json({ error: 'Failed to start scheduler' });
  }
};

const stopScheduler = (req, res) => {
  try {
    schedulerService.stop();
    res.json({ 
      success: true, 
      message: 'Automatic posting system stopped',
      status: schedulerService.getStatus()
    });
  } catch (error) {
    console.error('Error stopping scheduler:', error);
    res.status(500).json({ error: 'Failed to stop scheduler' });
  }
};

const getSchedulerStatus = (req, res) => {
  try {
    const status = schedulerService.getStatus();
    const rateLimitStatus = rateLimitService.getQueueStatus();
    
    res.json({
      ...status,
      rateLimit: rateLimitStatus
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
};

const updateSchedulerConfig = (req, res) => {
  try {
    const newConfig = req.body;
    schedulerService.updateConfig(newConfig);
    res.json({ 
      success: true, 
      message: 'Scheduler configuration updated',
      config: schedulerService.getStatus().config
    });
  } catch (error) {
    console.error('Error updating scheduler config:', error);
    res.status(500).json({ error: 'Failed to update scheduler config' });
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  updateSchedulerConfig
};