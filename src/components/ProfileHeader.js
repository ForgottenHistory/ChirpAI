import React from 'react';

const ProfileHeader = ({ character, totalPosts }) => {
  return (
    <div className="profile-header">
      <div className="profile-avatar-container">
        <img 
          src={character.avatar} 
          alt={character.name} 
          className="profile-avatar"
        />
      </div>
      
      <div className="profile-info">
        <div className="profile-username">
          <h1>@{character.username}</h1>
          <button className="follow-btn">Follow</button>
        </div>
        
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">{totalPosts}</span>
            <span className="stat-label">posts</span>
          </div>
          <div className="stat">
            <span className="stat-number">1.2k</span>
            <span className="stat-label">followers</span>
          </div>
          <div className="stat">
            <span className="stat-number">543</span>
            <span className="stat-label">following</span>
          </div>
        </div>
        
        <div className="profile-details">
          <h2 className="profile-name">{character.name}</h2>
          <p className="profile-bio">{character.bio}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;