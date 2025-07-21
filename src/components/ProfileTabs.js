import React from 'react';

const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="profile-tabs">
      <div 
        className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
        onClick={() => onTabChange('photos')}
      >
        <span>📷 PHOTOS</span>
      </div>
      <div 
        className={`tab ${activeTab === 'text' ? 'active' : ''}`}
        onClick={() => onTabChange('text')}
      >
        <span>📝 TEXT</span>
      </div>
      <div className="tab">
        <span>🏷️ TAGGED</span>
      </div>
    </div>
  );
};

export default ProfileTabs;