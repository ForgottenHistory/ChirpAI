const { generatePost } = require('../services/aiService');
const { generateImage } = require('../services/imageService');
const { createPost: createPostInDB, getAllPosts, addLike, removeLike, isPostLiked } = require('../services/postService');

const createPost = async (req, res) => {
  try {
    const { characterId, includeImage = false } = req.body;

    const postContent = await generatePost(characterId);

    let imageUrl = null;
    if (includeImage) {
      try {
        const imageResult = await generateImage(characterId, postContent);
        imageUrl = imageResult.imageUrl;
      } catch (imageError) {
        console.error('Image generation failed:', imageError.message);
      }
    }

    // Save to database
    const dbPost = createPostInDB(characterId, postContent, imageUrl);

    res.json({
      id: dbPost.id,
      content: dbPost.content,
      characterId: dbPost.userId,
      timestamp: dbPost.timestamp || dbPost.created_at, // Use actual DB timestamp
      likes: dbPost.likes,
      imageUrl: dbPost.imageUrl
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating post:`, error);
    res.status(500).json({ error: 'Failed to generate post' });
  }
};

const getPosts = (req, res) => {
  try {
    const posts = getAllPosts();
    
    // Send the raw timestamp - let frontend format it
    const formattedPosts = posts.map(post => ({
      id: post.id,
      userId: post.userId,
      user_id: post.user_id,
      user_type: post.user_type,
      content: post.content,
      imageUrl: post.imageUrl,
      likes: post.likes,
      timestamp: post.timestamp || post.created_at // Use raw timestamp from DB
    }));
    
    res.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

const toggleLike = (req, res) => {
  try {
    const { postId } = req.body;
    const userId = 0; // For now, we'll use 0 as the user ID (you as the human user)

    const alreadyLiked = isPostLiked(postId, userId);

    if (alreadyLiked) {
      removeLike(postId, userId);
    } else {
      addLike(postId, userId);
    }

    res.json({
      success: true,
      liked: !alreadyLiked
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

const createImage = async (req, res) => {
  try {
    const { characterId, postContent } = req.body;
    const result = await generateImage(characterId, postContent);
    res.json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generating image:`, error);
    res.status(500).json({ error: 'Failed to generate image. Make sure Automatic1111 is running with --api flag on port 7860' });
  }
};

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  createImage
};