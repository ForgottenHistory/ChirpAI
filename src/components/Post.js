import React from 'react';
import { Link } from 'react-router-dom';
import Comment from './Comment';

const Post = ({ 
  post, 
  character, 
  isLiked, 
  comments, 
  onLike, 
  onComment, 
  generatingComment,
  getCharacterById 
}) => {
  if (!character) return null;

  return (
    <div className="post">
      <div className="post-header">
        <Link to={`/user/${character.id}`} className="avatar-link">
          <img src={character.avatar} alt={character.name} className="avatar" />
        </Link>
        <div className="user-info">
          <Link to={`/user/${character.id}`} className="username-link">
            <span className="username">@{character.username}</span>
          </Link>
          <span className="timestamp">{post.timestamp}</span>
        </div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        {post.imageUrl && (
          <img 
            src={post.imageUrl} 
            alt="Generated content" 
            className="post-image"
          />
        )}
      </div>
      
      <div className="post-actions">
        <button 
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
        >
          {isLiked ? '❤️' : '🤍'} {post.likes}
        </button>
        <button 
          onClick={() => onComment(post.id)}
          disabled={generatingComment === post.id}
        >
          {generatingComment === post.id ? '💭 Generating...' : '💬 Comment'}
        </button>
      </div>
      
      {comments.length > 0 && (
        <div className="comments-section">
          {comments.map(comment => (
            <Comment 
              key={comment.id} 
              comment={comment} 
              character={getCharacterById(comment.userId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Post;