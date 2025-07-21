import { useState } from 'react';

export const usePosts = (initialPosts = []) => {
  const [posts, setPosts] = useState(initialPosts);
  const [likedPosts, setLikedPosts] = useState(new Set());

  const addPost = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const toggleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    const isLiked = likedPosts.has(postId);
    
    if (isLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    
    setLikedPosts(newLikedPosts);
    
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + (isLiked ? -1 : 1) }
        : post
    ));
  };

  return {
    posts,
    likedPosts,
    addPost,
    toggleLike,
    setPosts // Add this line
  };
};