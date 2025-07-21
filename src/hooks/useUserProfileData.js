import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useUserProfileData = (userId) => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch all characters first
        const charactersResponse = await api.getCharacters();
        setCharacters(charactersResponse.data);
        
        // Fetch the specific user
        const userResponse = await api.getUser(userId);
        const foundUser = userResponse.data;
        
        if (!foundUser) {
          setError('User not found');
          return;
        }
        
        console.log('Found user with data:', {
          id: foundUser.id,
          username: foundUser.username,
          followers_count: foundUser.followers_count,
          following_count: foundUser.following_count
        });
        
        setUser(foundUser);
        
        // Fetch all posts - filter for user posts
        const postsResponse = await api.getPosts();
        console.log(`[PROFILE] All posts from API:`, postsResponse.data.map(p => ({
          id: p.id,
          user_type: p.user_type,
          user_id: p.user_id,
          userId: p.userId,
          content: p.content.substring(0, 30) + '...'
        })));
        
        const userPosts = postsResponse.data.filter(post => {
          const isUserPost = post.user_type === 'user' && post.user_id === parseInt(userId);
          console.log(`[PROFILE] Checking post ${post.id}: user_type=${post.user_type}, user_id=${post.user_id}, target_userId=${userId}, isMatch=${isUserPost}`);
          return isUserPost;
        });
        
        console.log(`[PROFILE] Found ${userPosts.length} posts for user ${userId}:`, userPosts);
        
        setPosts(userPosts);
        
        // Load comments for user posts (if any)
        if (userPosts.length > 0) {
          const commentsPromises = userPosts.map(post => 
            api.getComments(post.id).then(response => ({
              postId: post.id,
              comments: response.data
            }))
          );
          
          const commentsResults = await Promise.all(commentsPromises);
          const commentsMap = {};
          commentsResults.forEach(({ postId, comments }) => {
            commentsMap[postId] = comments;
          });
          setComments(commentsMap);
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const addComment = (postId, comment) => {
    setComments(prevComments => ({
      ...prevComments,
      [postId]: [...(prevComments[postId] || []), comment]
    }));
  };

  const getCharacterById = (userId) => {
    return characters.find(char => char.id === userId);
  };

  const getCommentsForPost = (postId) => {
    return comments[postId] || [];
  };

  return {
    user,
    posts,
    characters,
    comments,
    loading,
    error,
    setPosts,
    setUser,
    addComment,
    getCharacterById,
    getCommentsForPost
  };
};