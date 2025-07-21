import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [character, setCharacter] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch character data
        const charactersResponse = await api.getCharacters();
        const foundCharacter = charactersResponse.data.find(char => char.id === parseInt(userId));
        
        if (!foundCharacter) {
          setError('User not found');
          return;
        }
        
        setCharacter(foundCharacter);
        
        // Fetch all posts and filter by user
        const postsResponse = await api.getPosts();
        const userPosts = postsResponse.data.filter(post => post.userId === parseInt(userId));
        
        setPosts(userPosts);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

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

  const postsWithImages = posts.filter(post => post.imageUrl);
  const totalPosts = posts.length;

  return (
    <div className="user-profile">
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

      <div className="profile-tabs">
        <div className="tab active">
          <span>📷 POSTS</span>
        </div>
        <div className="tab">
          <span>🎬 REELS</span>
        </div>
        <div className="tab">
          <span>🏷️ TAGGED</span>
        </div>
      </div>

      <div className="posts-grid">
        {postsWithImages.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon">📷</div>
            <h3>No Photos Yet</h3>
            <p>When {character.name} shares photos, they'll appear here.</p>
          </div>
        ) : (
          postsWithImages.map((post) => (
            <div key={post.id} className="grid-post">
              <img 
                src={post.imageUrl} 
                alt="Post" 
                className="grid-post-image"
              />
              <div className="grid-post-overlay">
                <div className="overlay-stats">
                  <span className="overlay-stat">
                    ❤️ {post.likes}
                  </span>
                  <span className="overlay-stat">
                    💬 {Math.floor(Math.random() * 10)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfile;