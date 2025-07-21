import React, { useState } from 'react';
import Post from './Post';

const Feed = ({ 
  posts, 
  characters, 
  likedPosts, 
  comments, 
  onLike, 
  onComment, 
  generatingComment 
}) => {
  const [expandedComments, setExpandedComments] = useState(new Set());

  const getCharacterById = (userId) => {
    return characters.find(char => char.id === userId);
  };

  const getCommentsForPost = (postId) => {
    return comments[postId] || [];
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

  // Auto-expand comments when a new comment is generated
  const handleComment = (postId) => {
    onComment(postId);
    // Auto-expand comments when generating a new one
    setExpandedComments(prev => new Set([...prev, postId]));
  };

  return (
    <div className="feed">
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          character={getCharacterById(post.userId)}
          isLiked={likedPosts.has(post.id)}
          comments={getCommentsForPost(post.id)}
          isCommentsExpanded={expandedComments.has(post.id)}
          onLike={onLike}
          onComment={handleComment}
          onToggleComments={toggleComments}
          generatingComment={generatingComment}
          getCharacterById={getCharacterById}
        />
      ))}
    </div>
  );
};

export default Feed;