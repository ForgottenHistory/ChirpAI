import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUserProfileData } from '../hooks/useUserProfileData';
import { useProfileInteractions } from '../hooks/useProfileInteractions';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import PhotoGrid from './PhotoGrid';
import TextPostList from './TextPostList';
import PhotoModal from './PhotoModal';
import './UserProfile.css';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedPost, setSelectedPost] = useState(null);

  // Custom hooks for data and interactions
  const {
    user,
    posts,
    characters,
    loading,
    error,
    setPosts,
    addComment,
    getCharacterById,
    getCommentsForPost
  } = useUserProfileData(userId);

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

  // Get the correct author for the modal based on post type
  const getModalAuthor = (post) => {
    if (!post) return null;
    
    const isUserPost = post.user_type === 'user';
    if (isUserPost) {
      // For user posts, return the user data in character format
      return userAsCharacter;
    } else {
      // For character posts, get from characters array
      const character = characters.find(char => char.id === post.userId);
      return character;
    }
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
        <div className="profile-navigation">
          <Link to="/" className="back-to-feed">
            ← Back to Feed
          </Link>
        </div>
        <div className="profile-loading">
          <div className="loading-spinner-small"></div>
          <span>Loading profile...</span>
        </div>
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

  if (!user) {
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

  // Convert user data to character format for ProfileHeader component
  const userAsCharacter = {
    id: user.id,
    username: user.username,
    name: user.display_name,
    avatar: user.avatar,
    bio: user.bio,
    followers_count: user.followers_count || 0,
    following_count: user.following_count || 0
  };

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
        character={userAsCharacter} 
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
          character={userAsCharacter}
          onPhotoClick={openPhotoModal}
          getCommentsForPost={getCommentsForPost}
        />
      ) : (
        <TextPostList
          posts={postsTextOnly}
          character={userAsCharacter}
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
        character={getModalAuthor(selectedPost)}
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

export default UserProfilePage;