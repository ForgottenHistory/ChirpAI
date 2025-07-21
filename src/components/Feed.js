import React from 'react';
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
  const getCharacterById = (userId) => {
    return characters.find(char => char.id === userId);
  };

  const getCommentsForPost = (postId) => {
    return comments[postId] || [];
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
          onLike={onLike}
          onComment={onComment}
          generatingComment={generatingComment}
          getCharacterById={getCharacterById}
        />
      ))}
    </div>
  );
};

export default Feed;