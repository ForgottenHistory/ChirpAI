const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, saveSettings, reloadSettings } = require('../controllers/settingsController');

// Settings routes
router.get('/settings', getSettings);
router.post('/settings', updateSettings);
router.post('/settings/save', saveSettings);
router.post('/settings/reload', reloadSettings);

module.exports = router;