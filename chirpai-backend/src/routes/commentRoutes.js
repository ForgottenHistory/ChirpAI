const express = require('express');
const router = express.Router();
const { createComment, getComments } = require('../controllers/commentController');

// Comment routes
router.post('/generate-comment', createComment);
router.get('/comments/:postId', getComments);

module.exports = router;