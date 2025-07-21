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
  const [errors, setErrors] = useState({});

  const MAX_CONTENT_LENGTH = 280;

  const validatePost = () => {
    const newErrors = {};
    
    if (!content.trim()) {
      newErrors.content = 'Post cannot be empty';
    } else if (content.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Post is too long (${content.length}/${MAX_CONTENT_LENGTH} characters)`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Clear errors when user starts typing
    if (errors.content && newContent.trim()) {
      setErrors(prev => ({ ...prev, content: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePost() || isPosting) return;

    setIsPosting(true);
    setErrors({});
    
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
        timestamp: response.data.timestamp || new Date().toISOString()
      };

      if (onPostCreated) {
        onPostCreated(newPost);
      }

      // Reset form
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreatePost(false);
      setErrors({});
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: 'Failed to create post. Please try again.' });
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
              onChange={handleContentChange}
              placeholder="Share your thoughts..."
              className={`post-textarea ${errors.content ? 'error' : ''}`}
              maxLength={MAX_CONTENT_LENGTH + 50} // Allow typing a bit over to show error
              rows={3}
              disabled={isPosting}
            />
            
            {errors.content && (
              <div className="post-error">{errors.content}</div>
            )}
            
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
                <span className={content.length > MAX_CONTENT_LENGTH - 20 ? 'warning' : content.length > MAX_CONTENT_LENGTH ? 'over-limit' : ''}>
                  {content.length}/{MAX_CONTENT_LENGTH}
                </span>
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePost(false);
                    setErrors({});
                    setContent('');
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="cancel-btn"
                  disabled={isPosting}
                >
                  Cancel
                </button>
                
                {/* Image Upload Button */}
                <label className={`image-upload-btn ${isPosting ? 'disabled' : ''}`}>
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
                  disabled={!content.trim() || isPosting || content.length > MAX_CONTENT_LENGTH}
                >
                  {isPosting ? (
                    <>
                      <span className="loading-spinner-btn"></span>
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </div>
            
            {errors.submit && (
              <div className="post-error submit-error">{errors.submit}</div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default CreatePost;