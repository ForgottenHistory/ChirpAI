import React from 'react';
import { useUser } from '../contexts/UserContext';

const ProfileHeader = ({ character, totalPosts }) => {
  const { currentUser } = useUser();
  
  // Format follower/following counts
  const formatCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  // Check if this is the current user's own profile
  const isOwnProfile = currentUser && currentUser.id === character.id;

  return (
    <div className="profile-header">
      <div className="profile-avatar-container">
        <img 
          src={character.avatar || '/avatars/avatar1.png'} 
          alt={character.name} 
          className="profile-avatar"
          onError={(e) => {
            e.target.src = '/avatars/avatar1.png';
          }}
        />
      </div>
      
      <div className="profile-info">
        <div className="profile-username">
          <h1>@{character.username}</h1>
          {!isOwnProfile && (
            <button className="follow-btn">Follow</button>
          )}
        </div>
        
        <div className="profile-stats">
          <div className="stat">
            <span className="stat-number">{totalPosts}</span>
            <span className="stat-label">posts</span>
          </div>
          <div className="stat">
            <span className="stat-number">{formatCount(character.followers_count || 0)}</span>
            <span className="stat-label">followers</span>
          </div>
          <div className="stat">
            <span className="stat-number">{formatCount(character.following_count || 0)}</span>
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