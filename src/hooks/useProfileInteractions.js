import { useState } from 'react';
import { api } from '../services/api';

export const useProfileInteractions = (posts, setPosts, addComment, characters) => {
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [generatingComment, setGeneratingComment] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());

  const handleToggleLike = async (postId) => {
    try {
      await api.toggleLike(postId);
      
      // Update local like state
      const newLikedPosts = new Set(likedPosts);
      const isLiked = likedPosts.has(postId);
      
      if (isLiked) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      
      setLikedPosts(newLikedPosts);
      
      // Update post likes count
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + (isLiked ? -1 : 1) }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleGenerateComment = async (postId) => {
    if (generatingComment) return;
    
    setGeneratingComment(postId);
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const availableCharacters = characters.filter(char => char.id !== post.userId);
      const randomCommenter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
      
      const response = await api.generateComment(
        post.content,
        randomCommenter.id,
        post.userId,
        postId
      );

      const newComment = {
        id: response.data.id,
        postId: response.data.postId,
        userId: response.data.commenterId,
        content: response.data.content,
        timestamp: response.data.timestamp
      };

      // Add comment to local state
      addComment(postId, newComment);

      // Auto-expand comments when a new one is generated
      setExpandedComments(prev => new Set([...prev, postId]));
      
    } catch (error) {
      console.error('Error generating comment:', error);
      alert('Failed to generate comment. Please try again.');
    } finally {
      setGeneratingComment(null);
    }
  };

  const toggleComments = (postId) => {
    const newExpanded = new Set(expandedComments);
    if (expandedComments.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  return {
    likedPosts,
    generatingComment,
    expandedComments,
    handleToggleLike,
    handleGenerateComment,
    toggleComments,
    setExpandedComments
  };
};