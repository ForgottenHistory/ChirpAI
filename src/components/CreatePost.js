import React, { useState } from 'react';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const { currentUser } = useUser();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      let imageUrl = null;
      
      // If there's a selected image, convert it to data URL
      if (selectedImage) {
        imageUrl = imagePreview;
      }
      
      const response = await api.createUserPost(content.trim(), imageUrl);
      
      // Create post object for frontend
      const newPost = {
        id: response.data.id,
        userId: 0, // Set to 0 for user posts
        user_id: currentUser.id,
        user_type: 'user',
        content: response.data.content,
        imageUrl: response.data.imageUrl,
        likes: response.data.likes || 0,
        timestamp: 'just now'
      };

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Reset form
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  if (!currentUser) return null;

  return (
    <div className="create-post-container">
      {!showCreatePost ? (
        <div className="create-post-trigger" onClick={() => setShowCreatePost(true)}>
          <img 
            src={currentUser.avatar || '/avatars/avatar1.png'} 
            alt={currentUser.display_name}
            className="trigger-avatar"
            onError={(e) => {
              e.target.src = '/avatars/avatar1.png';
            }}
          />
          <div className="trigger-text">What's on your mind, {currentUser.display_name}?</div>
        </div>
      ) : (
        <div className="create-post-form">
          <div className="create-post-header">
            <img 
              src={currentUser.avatar || '/avatars/avatar1.png'} 
              alt={currentUser.display_name}
              className="form-avatar"
              onError={(e) => {
                e.target.src = '/avatars/avatar1.png';
              }}
            />
            <div className="form-user-info">
              <div className="form-display-name">{currentUser.display_name}</div>
              <div className="form-username">@{currentUser.username}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="post-form">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="post-textarea"
              maxLength={280}
              rows={3}
              disabled={isPosting}
            />
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Selected" className="preview-image" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="remove-image-btn"
                  disabled={isPosting}
                >
                  ✕
                </button>
              </div>
            )}
            
            <div className="form-footer">
              <div className="character-count">
                <span className={content.length > 250 ? 'warning' : ''}>
                  {content.length}/280
                </span>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="cancel-btn"
                  disabled={isPosting}
                >
                  Cancel
                </button>
                
                {/* Image Upload Button */}
                <label className="image-upload-btn">
                  📷 Add Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={isPosting}
                  />
                </label>
                
                <button
                  type="submit"
                  className="post-btn"
                  disabled={!content.trim() || isPosting}
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreatePost;