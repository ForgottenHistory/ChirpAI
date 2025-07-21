import React from 'react';
import Comment from './Comment';

const TextPostList = ({ 
  posts, 
  character, 
  likedPosts, 
  comments,
  expandedComments,
  generatingComment,
  onLike, 
  onComment, 
  onToggleComments,
  getCharacterById,
  getCommentsForPost 
}) => {
  if (posts.length === 0) {
    return (
      <div className="text-posts">
        <div className="no-posts">
          <div className="no-posts-icon">📝</div>
          <h3>No Text Posts Yet</h3>
          <p>When {character.name} shares text posts, they'll appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-posts">
      {posts.map((post) => {
        const postComments = getCommentsForPost(post.id);
        const isCommentsExpanded = expandedComments.has(post.id);
        
        return (
          <div key={post.id} className="text-post">
            <div className="text-post-content">
              <p>{post.content}</p>
            </div>
            
            <div className="text-post-actions">
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
              {postComments.length > 0 && (
                <button 
                  className="toggle-comments-btn"
                  onClick={() => onToggleComments(post.id)}
                >
                  {isCommentsExpanded ? '🔽' : '▶️'} {postComments.length} comment{postComments.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>

            <div className="text-post-footer">
              <span className="text-post-timestamp">{post.timestamp}</span>
            </div>

            {/* Comments section */}
            {postComments.length > 0 && isCommentsExpanded && (
              <div className="comments-section">
                {postComments.map(comment => (
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
      })}
    </div>
  );
};

export default TextPostList;