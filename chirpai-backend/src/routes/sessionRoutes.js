const express = require('express');
const router = express.Router();
const { getSession, switchUser, toggleAdminMode } = require('../controllers/userController');

// Session management routes
router.get('/session', getSession);
router.post('/session/switch-user', switchUser);
router.post('/session/admin-mode', toggleAdminMode);

module.exports = router;