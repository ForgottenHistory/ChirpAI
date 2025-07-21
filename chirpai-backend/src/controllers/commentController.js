const { generateComment } = require('../services/aiService');
const { createComment: createCommentInDB, getCommentsForPost } = require('../services/commentService');

const createComment = async (req, res) => {
  try {
    const { postContent, commenterCharacterId, originalPosterId, postId } = req.body;
    
    const commentContent = await generateComment(postContent, commenterCharacterId, originalPosterId);
    
    // Save to database
    const dbComment = createCommentInDB(postId, commenterCharacterId, commentContent);
    
    res.json({ 
      id: dbComment.id,
      postId: dbComment.postId,
      content: dbComment.content,
      commenterId: dbComment.userId,
      timestamp: 'just now'
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
      timestamp: 'some time ago' // You can format this like posts if needed
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