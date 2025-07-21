const express = require('express');
const router = express.Router();
const { createPost, getPosts, toggleLike, createImage } = require('../controllers/postController');

// Post routes
router.get('/posts', getPosts);
router.post('/generate-post', createPost);
router.post('/toggle-like', toggleLike);
router.post('/generate-image', createImage);

// User post routes
router.post('/create-user-post', async (req, res) => {
  try {
    const { content, imageUrl = null } = req.body;
    const { getCurrentUser } = require('../services/userService');
    const { createPost } = require('../services/postService');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return res.status(401).json({ error: 'No user logged in' });
    }
    
    console.log(`[USER_POST] Creating post for user ${currentUser.id} (${currentUser.username})`);
    console.log(`[USER_POST] Content: "${content}"`);
    
    // Create post with user_type
    const dbPost = createPost(currentUser.id, content, imageUrl, 'user');
    
    console.log(`[USER_POST] Created post with ID: ${dbPost.id}`);
    console.log(`[USER_POST] Post data from DB:`, dbPost);
    
    // Verify it was saved correctly by reading it back
    const { getPostById } = require('../services/postService');
    const verifyPost = getPostById(dbPost.id);
    console.log(`[USER_POST] Verification - post ${dbPost.id} from DB:`, verifyPost);
    
    res.json({
      id: dbPost.id,
      content: dbPost.content,
      imageUrl: dbPost.imageUrl,
      likes: dbPost.likes || 0,
      userId: 0, // Set to 0 for user posts to avoid confusion with character IDs
      user_id: currentUser.id,
      user_type: 'user'
    });
  } catch (error) {
    console.error('Error creating user post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

module.exports = router;