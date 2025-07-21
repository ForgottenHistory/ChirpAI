import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useProfileData = (userId) => {
  const [character, setCharacter] = useState(null);
  const [posts, setPosts] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch all characters
        const charactersResponse = await api.getCharacters();
        setCharacters(charactersResponse.data);
        
        // Find the specific character
        const foundCharacter = charactersResponse.data.find(char => char.id === parseInt(userId));
        
        if (!foundCharacter) {
          setError('User not found');
          return;
        }
        
        setCharacter(foundCharacter);
        
        // Fetch all posts and filter by user
        const postsResponse = await api.getPosts();
        const userPosts = postsResponse.data.filter(post => post.userId === parseInt(userId));
        
        setPosts(userPosts);
        
        // Load comments for all user posts
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
    character,
    posts,
    characters,
    comments,
    loading,
    error,
    setPosts,
    addComment,
    getCharacterById,
    getCommentsForPost
  };
};