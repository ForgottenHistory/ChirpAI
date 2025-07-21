import React from 'react';

const Comment = ({ comment, character }) => {
  return (
    <div className="comment">
      <img src={character.avatar} alt={character.name} className="comment-avatar" />
      <div className="comment-content">
        <span className="comment-username">@{character.username}</span>
        <span className="comment-text">{comment.content}</span>
      </div>
    </div>
  );
};

export default Comment;