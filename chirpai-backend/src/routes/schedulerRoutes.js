const express = require('express');
const router = express.Router();
const { startScheduler, stopScheduler, getSchedulerStatus, updateSchedulerConfig } = require('../controllers/schedulerController');

// Scheduler routes
router.post('/scheduler/start', startScheduler);
router.post('/scheduler/stop', stopScheduler);
router.get('/scheduler/status', getSchedulerStatus);
router.post('/scheduler/config', updateSchedulerConfig);

module.exports = router;