import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProfileData } from '../hooks/useProfileData';
import { useProfileInteractions } from '../hooks/useProfileInteractions';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import PhotoGrid from './PhotoGrid';
import TextPostList from './TextPostList';
import PhotoModal from './PhotoModal';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedPost, setSelectedPost] = useState(null);

  // Custom hooks for data and interactions
  const {
    character,
    posts,
    characters,
    loading,
    error,
    setPosts,
    addComment,
    getCharacterById,
    getCommentsForPost
  } = useProfileData(userId);

  const {
    likedPosts,
    generatingComment,
    expandedComments,
    handleToggleLike,
    handleGenerateComment,
    toggleComments,
    setExpandedComments
  } = useProfileInteractions(posts, setPosts, addComment, characters);

  // Modal management
  const openPhotoModal = (post) => {
    setSelectedPost(post);
    setExpandedComments(prev => new Set([...prev, post.id]));
  };

  const closePhotoModal = () => {
    setSelectedPost(null);
  };

  // Handle modal keyboard events
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closePhotoModal();
      }
    };

    if (selectedPost) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPost]);

  // Loading and error states
  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="user-profile">
        <div className="error">User not found</div>
      </div>
    );
  }

  // Filter posts by type
  const postsWithImages = posts.filter(post => post.imageUrl);
  const postsTextOnly = posts.filter(post => !post.imageUrl);
  const totalPosts = posts.length;

  return (
    <div className="user-profile">
      {/* Navigation */}
      <div className="profile-navigation">
        <Link to="/" className="back-to-feed">
          ← Back to Feed
        </Link>
      </div>

      {/* Profile Header */}
      <ProfileHeader 
        character={character} 
        totalPosts={totalPosts} 
      />

      {/* Profile Tabs */}
      <ProfileTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Content based on active tab */}
      {activeTab === 'photos' ? (
        <PhotoGrid
          posts={postsWithImages}
          character={character}
          onPhotoClick={openPhotoModal}
          getCommentsForPost={getCommentsForPost}
        />
      ) : (
        <TextPostList
          posts={postsTextOnly}
          character={character}
          likedPosts={likedPosts}
          expandedComments={expandedComments}
          generatingComment={generatingComment}
          onLike={handleToggleLike}
          onComment={handleGenerateComment}
          onToggleComments={toggleComments}
          getCharacterById={getCharacterById}
          getCommentsForPost={getCommentsForPost}
        />
      )}

      {/* Photo Modal */}
      <PhotoModal
        post={selectedPost}
        character={character}
        isVisible={!!selectedPost}
        likedPosts={likedPosts}
        generatingComment={generatingComment}
        onClose={closePhotoModal}
        onLike={handleToggleLike}
        onComment={handleGenerateComment}
        getCharacterById={getCharacterById}
        getCommentsForPost={getCommentsForPost}
      />
    </div>
  );
};

export default UserProfile;