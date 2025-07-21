const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUser, 
  createNewUser, 
  updateUserProfile, 
  removeUser
} = require('../controllers/userController');

// User management routes
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.post('/users', createNewUser);
router.put('/users/:id', updateUserProfile);
router.delete('/users/:id', removeUser);

module.exports = router;