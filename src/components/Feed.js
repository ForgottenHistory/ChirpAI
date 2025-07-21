import React, { useState } from 'react';
import Post from './Post';
import CreatePost from './CreatePost';
import { useUser } from '../contexts/UserContext';

const Feed = ({ 
  posts, 
  characters, 
  likedPosts, 
  comments, 
  onLike, 
  onComment, 
  generatingComment,
  onPostCreated 
}) => {
  const { currentUser, users } = useUser();
  const [expandedComments, setExpandedComments] = useState(new Set());

  const getCharacterById = (userId) => {
    return characters.find(char => char.id === userId);
  };

  const getUserById = (userId) => {
    // Look for user in the users array from context
    const foundUser = users.find(user => user.id === userId);
    if (foundUser) {
      return {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.display_name,
        avatar: foundUser.avatar
      };
    }
    
    // Fallback to current user if it matches
    if (currentUser && currentUser.id === userId) {
      return {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.display_name,
        avatar: currentUser.avatar
      };
    }
    
    return null;
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
      {/* Create Post Component for logged in users */}
      {currentUser && (
        <CreatePost onPostCreated={onPostCreated} />
      )}
      
      {posts.map(post => {
        // Determine if this is a user post or character post
        const isUserPost = post.user_type === 'user';
        let author;
        
        if (isUserPost) {
          // For user posts, use user_id field
          const userId = post.user_id || post.userId;
          author = getUserById(userId);
        } else {
          // For character posts, use userId field
          author = getCharacterById(post.userId);
        }
        
        if (!author) {
          console.warn(`Could not find author for post ${post.id}:`, {
            isUserPost,
            userId: post.userId,
            user_id: post.user_id,
            user_type: post.user_type
          });
          return null;
        }
        
        return (
          <Post
            key={post.id}
            post={post}
            character={author}
            isLiked={likedPosts.has(post.id)}
            comments={getCommentsForPost(post.id)}
            isCommentsExpanded={expandedComments.has(post.id)}
            onLike={onLike}
            onComment={handleComment}
            onToggleComments={toggleComments}
            generatingComment={generatingComment}
            getCharacterById={getCharacterById}
            getUserById={getUserById}
            isUserPost={isUserPost}
          />
        );
      })}
    </div>
  );
};

export default Feed;