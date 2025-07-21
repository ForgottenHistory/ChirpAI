const { generateComment } = require('../services/aiService');
const { createComment: createCommentInDB, getCommentsForPost } = require('../services/commentService');
const { getPostById } = require('../services/postService');
const { getCurrentUser } = require('../services/userService');

const createComment = async (req, res) => {
  try {
    const { postContent, commenterCharacterId, originalPosterId, postId } = req.body;
    
    // Get the actual post to check if it's a user post
    const post = getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    let originalPosterName;
    let originalPosterType;
    
    // Check if this is a user post or character post
    if (post.user_type === 'user') {
      // This is a user post, get the user info
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.id === post.user_id) {
        originalPosterName = currentUser.display_name;
        originalPosterType = 'user';
      } else {
        return res.status(400).json({ error: 'Could not identify post author' });
      }
    } else {
      // This is a character post, use original logic
      originalPosterName = null; // Will be handled by AI service
      originalPosterType = 'character';
    }
    
    const commentContent = await generateComment(
      postContent, 
      commenterCharacterId, 
      originalPosterId, 
      originalPosterName,
      originalPosterType
    );
    
    // Save to database
    const dbComment = createCommentInDB(postId, commenterCharacterId, commentContent);
    
    res.json({ 
      id: dbComment.id,
      postId: dbComment.postId,
      content: dbComment.content,
      commenterId: dbComment.userId,
      timestamp: dbComment.timestamp || dbComment.created_at // Use actual DB timestamp
    });

  } catch (error) {
    console.error('Error generating comment:', error);
    res.status(500).json({ error: 'Failed to generate comment' });
  }
};

const getComments = (req, res) => {
  try {
    const { postId } = req.params;
    const comments = getCommentsForPost(postId);
    
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      timestamp: comment.timestamp || comment.created_at // Use actual DB timestamp
    }));
    
    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

module.exports = {
  createComment,
  getComments
};