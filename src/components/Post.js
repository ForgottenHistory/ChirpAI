import React from 'react';
import { Link } from 'react-router-dom';
import Comment from './Comment';

const Post = ({ 
  post, 
  character, 
  isLiked, 
  comments, 
  isCommentsExpanded,
  onLike, 
  onComment, 
  onToggleComments,
  generatingComment,
  getCharacterById,
  getUserById,
  isUserPost = false
}) => {
  if (!character) return null;

  const hasComments = comments.length > 0;
  
  // Determine the profile link based on post type
  const profileLink = isUserPost ? `/profile/${character.id}` : `/user/${character.id}`;

  return (
    <div className="post">
      <div className="post-header">
        <Link to={profileLink} className="avatar-link">
          <img 
            src={character.avatar || '/avatars/avatar1.png'} 
            alt={character.name} 
            className="avatar"
            onError={(e) => {
              e.target.src = '/avatars/avatar1.png';
            }}
          />
        </Link>
        <div className="user-info">
          <Link to={profileLink} className="username-link">
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
        {hasComments && (
          <button 
            className="toggle-comments-btn"
            onClick={() => onToggleComments(post.id)}
          >
            {isCommentsExpanded ? '🔽' : '▶️'} {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>
      
      {hasComments && isCommentsExpanded && (
        <div className="comments-section">
          {comments.map(comment => {
            // Comments are always from AI characters for now
            const commenter = getCharacterById(comment.userId);
            return (
              <Comment 
                key={comment.id} 
                comment={comment} 
                character={commenter}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Post;