import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './UserCreation.css';

const UserCreation = ({ onUserCreated }) => {
  const { createUser } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: ''
  });
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});

  // Predefined avatar options - using local files from public folder
  const avatarOptions = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png', 
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png',
    '/avatars/avatar8.png'
  ];

  const validateUsername = (username) => {
    if (!username.trim()) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Real-time username validation
    if (field === 'username') {
      const error = validateUsername(value);
      setErrors(prev => ({
        ...prev,
        username: error
      }));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ avatar: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ avatar: 'Image must be smaller than 5MB' });
      return;
    }

    setUploadingAvatar(true);
    try {
      // Create a data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedAvatar(e.target.result);
        setSelectedAvatar(-1); // Deselect predefined avatars
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrors({ avatar: 'Failed to process image' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      setErrors({ username: usernameError });
      return;
    }

    if (!formData.display_name.trim()) {
      setErrors({ display_name: 'Display name is required' });
      return;
    }

    setCreating(true);
    try {
      const userData = {
        username: formData.username.toLowerCase().trim(),
        display_name: formData.display_name.trim(),
        bio: formData.bio.trim(),
        avatar: uploadedAvatar || avatarOptions[selectedAvatar]
      };

      const newUser = await createUser(userData);
      console.log('User created successfully:', newUser);
      
      if (onUserCreated) {
        onUserCreated(newUser);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.status === 409) {
        setErrors({ username: 'Username already exists' });
      } else {
        setErrors({ general: 'Failed to create user. Please try again.' });
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="user-creation-page">
      <div className="creation-container">
        <div className="creation-header">
          <h1>Welcome to ChirpAI! 🎉</h1>
          <p>Let's create your profile to get started</p>
        </div>

        <form className="creation-form" onSubmit={handleSubmit}>
          {/* Avatar Selection */}
          <div className="form-section">
            <label className="form-label">Choose Your Avatar</label>
            
            {/* Upload Option */}
            <div className="avatar-upload-section">
              <label className="avatar-upload-btn">
                {uploadingAvatar ? (
                  <div className="upload-loading">
                    <span className="loading-spinner"></span>
                    Uploading...
                  </div>
                ) : (
                  <>📁 Upload Your Own</>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingAvatar}
                />
              </label>
              {errors.avatar && <span className="error-text">{errors.avatar}</span>}
            </div>

            {/* Custom uploaded avatar preview */}
            {uploadedAvatar && (
              <div className="uploaded-avatar-preview">
                <div
                  className={`avatar-option uploaded ${selectedAvatar === -1 ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(-1)}
                >
                  <img src={uploadedAvatar} alt="Uploaded avatar" />
                </div>
                <span className="upload-label">Your Upload</span>
              </div>
            )}

            {/* Predefined avatars */}
            <div className="avatar-grid">
              {avatarOptions.map((avatar, index) => (
                <div
                  key={index}
                  className={`avatar-option ${selectedAvatar === index ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedAvatar(index);
                    setUploadedAvatar(null);
                  }}
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Username */}
          <div className="form-section">
            <label className="form-label">Username *</label>
            <input
              type="text"
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="e.g. johndoe123"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              maxLength={20}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
            <span className="help-text">Your unique identifier on the platform</span>
          </div>

          {/* Display Name */}
          <div className="form-section">
            <label className="form-label">Display Name *</label>
            <input
              type="text"
              className={`form-input ${errors.display_name ? 'error' : ''}`}
              placeholder="e.g. John Doe"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              maxLength={50}
            />
            {errors.display_name && <span className="error-text">{errors.display_name}</span>}
            <span className="help-text">How others will see your name</span>
          </div>

          {/* Bio */}
          <div className="form-section">
            <label className="form-label">Bio (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Tell us a bit about yourself..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              maxLength={160}
              rows={3}
            />
            <span className="help-text">{formData.bio.length}/160 characters</span>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="error-message">
              {errors.general}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="create-button"
            disabled={creating || !!errors.username}
          >
            {creating ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create My Account 🚀'
            )}
          </button>
        </form>

        <div className="creation-footer">
          <p>You'll be able to post, comment, and interact with AI characters!</p>
        </div>
      </div>
    </div>
  );
};

export default UserCreation;