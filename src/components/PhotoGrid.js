import React from 'react';

const PhotoGrid = ({ posts, character, onPhotoClick, getCommentsForPost }) => {
  if (posts.length === 0) {
    return (
      <div className="posts-grid">
        <div className="no-posts">
          <div className="no-posts-icon">📷</div>
          <h3>No Photos Yet</h3>
          <p>When {character.name} shares photos, they'll appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-grid">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="grid-post"
          onClick={() => onPhotoClick(post)}
        >
          <img 
            src={post.imageUrl} 
            alt="Post" 
            className="grid-post-image"
          />
          <div className="grid-post-overlay">
            <div className="overlay-stats">
              <span className="overlay-stat">
                ❤️ {post.likes}
              </span>
              <span className="overlay-stat">
                💬 {getCommentsForPost(post.id).length}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;