import { useState } from 'react';

export const useComments = () => {
  const [comments, setComments] = useState({});

  const addComment = (postId, comment) => {
    setComments(prevComments => ({
      ...prevComments,
      [postId]: [...(prevComments[postId] || []), comment]
    }));
  };

  const getCommentsForPost = (postId) => {
    return comments[postId] || [];
  };

  return {
    comments,
    addComment,
    getCommentsForPost,
    setComments // Add this line
  };
};