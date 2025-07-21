import React from 'react';
import { Link } from 'react-router-dom';
import Comment from './Comment';

const PhotoModal = ({ 
  post, 
  character, 
  isVisible,
  likedPosts,
  generatingComment,
  onClose, 
  onLike, 
  onComment,
  getCharacterById,
  getCommentsForPost 
}) => {
  if (!isVisible || !post) return null;

  console.log('[PHOTO_MODAL] Post data:', post);
  console.log('[PHOTO_MODAL] Character data:', character);

  const postComments = getCommentsForPost(post.id);

  return (
    <div className="photo-modal" onClick={onClose}>
      <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="photo-modal-close" onClick={onClose}>
          ✕
        </button>
        
        <div className="photo-modal-left">
          <img 
            src={post.imageUrl} 
            alt="Post" 
            className="photo-modal-image"
          />
        </div>
        
        <div className="photo-modal-right">
          <div className="photo-modal-header">
            <Link 
              to={post.user_type === 'user' ? `/profile/${character.id}` : `/user/${character.id}`} 
              className="modal-user-link"
            >
              <img 
                src={character.avatar || '/avatars/avatar1.png'} 
                alt={character.name} 
                className="modal-avatar"
                onError={(e) => {
                  e.target.src = '/avatars/avatar1.png';
                }}
              />
              <span className="modal-username">@{character.username}</span>
            </Link>
            <span className="modal-timestamp">{post.timestamp}</span>
          </div>
          
          <div className="photo-modal-content-text">
            <p>{post.content}</p>
          </div>
          
          <div className="photo-modal-actions">
            <button 
              className={`like-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
              onClick={() => onLike(post.id)}
            >
              {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
            </button>
            <button 
              onClick={() => onComment(post.id)}
              disabled={generatingComment === post.id}
            >
              {generatingComment === post.id ? '💭 Generating...' : '💬 Comment'}
            </button>
          </div>

          {/* Comments in modal */}
          <div className="photo-modal-comments">
            {postComments.map(comment => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                character={getCharacterById(comment.userId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;