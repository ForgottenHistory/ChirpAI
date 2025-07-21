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
      console.log(`Found user ${userId}:`, foundUser);
      return {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.display_name,
        avatar: foundUser.avatar
      };
    }
    
    // Fallback to current user if it matches
    if (currentUser && currentUser.id === userId) {
      console.log(`Using current user for ${userId}:`, currentUser);
      return {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.display_name,
        avatar: currentUser.avatar
      };
    }
    
    console.log(`No user found for ID ${userId}. Available users:`, users);
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
      
      {/* Debug: Show posts count */}
      {console.log(`[FEED] Rendering ${posts.length} posts for user ${currentUser?.username}:`, 
        posts.map(p => ({ id: p.id, user_type: p.user_type, user_id: p.user_id, userId: p.userId }))
      )}
      
      {posts.map(post => {
        // First check user_type to determine post type
        const isUserPost = post.user_type === 'user';
        let author;
        
        if (isUserPost) {
          // For user posts, use user_id field
          const userId = post.user_id;
          author = getUserById(userId);
          console.log(`Processing user post ${post.id} for user ${userId}:`, author);
        } else {
          // For character posts, use userId field (should be > 0 for characters)
          const characterId = post.userId;
          author = getCharacterById(characterId);
          console.log(`Processing character post ${post.id} for character ${characterId}:`, author);
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