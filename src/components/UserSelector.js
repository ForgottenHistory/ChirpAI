import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './UserSelector.css';

const UserSelector = () => {
  const { 
    currentUser, 
    isAdminMode, 
    users, 
    switchUser, 
    toggleAdminMode
  } = useUser();
  
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSwitchUser = async (userId) => {
    try {
      await switchUser(userId);
      setShowDropdown(false);
    } catch (error) {
      alert('Failed to switch user');
    }
  };

  const handleToggleAdminMode = async () => {
    // Only allow admin users to enable admin mode
    if (!isAdminMode && !currentUser.is_admin) {
      alert('Only admin users can enable admin mode');
      return;
    }
    
    try {
      await toggleAdminMode();
    } catch (error) {
      alert('Failed to toggle admin mode');
    }
  };

  const formatCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  if (!currentUser) {
    return <div className="user-selector-loading">Loading user...</div>;
  }

  return (
    <div className="user-selector">
      <div className="current-user" onClick={() => setShowDropdown(!showDropdown)}>
        <img src={currentUser.avatar} alt={currentUser.display_name} className="user-avatar" />
        <div className="user-info">
          <div className="user-name">{currentUser.display_name}</div>
          <div className="user-stats">
            {formatCount(currentUser.followers_count)} followers
          </div>
        </div>
        <div className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</div>
      </div>

      {showDropdown && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <h3>Switch User</h3>
            <button 
              className="close-dropdown"
              onClick={() => setShowDropdown(false)}
            >
              ✕
            </button>
          </div>

          <div className="user-list">
            {users.map(user => (
              <div 
                key={user.id}
                className={`user-option ${currentUser.id === user.id ? 'active' : ''}`}
                onClick={() => handleSwitchUser(user.id)}
              >
                <img src={user.avatar} alt={user.display_name} className="option-avatar" />
                <div className="option-info">
                  <div className="option-name">{user.display_name}</div>
                  <div className="option-username">@{user.username}</div>
                  <div className="option-stats">
                    {formatCount(user.followers_count)} followers
                  </div>
                </div>
                {user.is_admin && <span className="admin-badge">Admin</span>}
              </div>
            ))}
          </div>

          <div className="dropdown-actions">
            {currentUser.is_admin && (
              <button 
                className={`admin-mode-btn ${isAdminMode ? 'active' : ''}`}
                onClick={handleToggleAdminMode}
              >
                {isAdminMode ? '👑 Admin Mode' : '👤 User Mode'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelector;