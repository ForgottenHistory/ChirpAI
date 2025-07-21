import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import Comment from './Comment';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [character, setCharacter] = useState(null);
  const [posts, setPosts] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [comments, setComments] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('photos');
  const [generatingComment, setGeneratingComment] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch all characters
        const charactersResponse = await api.getCharacters();
        setCharacters(charactersResponse.data);
        
        // Find the specific character
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
        
        // Load comments for all user posts
        const commentsPromises = userPosts.map(post => 
          api.getComments(post.id).then(response => ({
            postId: post.id,
            comments: response.data
          }))
        );
        
        const commentsResults = await Promise.all(commentsPromises);
        const commentsMap = {};
        commentsResults.forEach(({ postId, comments }) => {
          commentsMap[postId] = comments;
        });
        setComments(commentsMap);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleToggleLike = async (postId) => {
    try {
      await api.toggleLike(postId);
      
      // Update local like state
      const newLikedPosts = new Set(likedPosts);
      const isLiked = likedPosts.has(postId);
      
      if (isLiked) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      
      setLikedPosts(newLikedPosts);
      
      // Update post likes count
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + (isLiked ? -1 : 1) }
          : post
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleGenerateComment = async (postId) => {
    if (generatingComment) return;
    
    setGeneratingComment(postId);
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const availableCharacters = characters.filter(char => char.id !== post.userId);
      const randomCommenter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
      
      const response = await api.generateComment(
        post.content,
        randomCommenter.id,
        post.userId,
        postId
      );

      const newComment = {
        id: response.data.id,
        postId: response.data.postId,
        userId: response.data.commenterId,
        content: response.data.content,
        timestamp: response.data.timestamp
      };

      // Add comment to local state
      setComments(prevComments => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), newComment]
      }));

      // Auto-expand comments when a new one is generated
      setExpandedComments(prev => new Set([...prev, postId]));
      
    } catch (error) {
      console.error('Error generating comment:', error);
      alert('Failed to generate comment. Please try again.');
    } finally {
      setGeneratingComment(null);
    }
  };

  const toggleComments = (postId) => {
    const newExpanded = new Set(expandedComments);
    if (expandedComments.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const getCharacterById = (userId) => {
    return characters.find(char => char.id === userId);
  };

  const getCommentsForPost = (postId) => {
    return comments[postId] || [];
  };

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
  const postsTextOnly = posts.filter(post => !post.imageUrl);
  const totalPosts = posts.length;

  const currentPosts = activeTab === 'photos' ? postsWithImages : postsTextOnly;

  return (
    <div className="user-profile">
      {/* Back to feed button */}
      <div className="profile-navigation">
        <Link to="/" className="back-to-feed">
          ← Back to Feed
        </Link>
      </div>

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
        <div 
          className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          <span>📷 PHOTOS</span>
        </div>
        <div 
          className={`tab ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <span>📝 TEXT</span>
        </div>
        <div className="tab">
          <span>🏷️ TAGGED</span>
        </div>
      </div>

      {activeTab === 'photos' ? (
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
                      💬 {getCommentsForPost(post.id).length}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-posts">
          {postsTextOnly.length === 0 ? (
            <div className="no-posts">
              <div className="no-posts-icon">📝</div>
              <h3>No Text Posts Yet</h3>
              <p>When {character.name} shares text posts, they'll appear here.</p>
            </div>
          ) : (
            postsTextOnly.map((post) => {
              const postComments = getCommentsForPost(post.id);
              const isCommentsExpanded = expandedComments.has(post.id);
              
              return (
                <div key={post.id} className="text-post">
                  <div className="text-post-content">
                    <p>{post.content}</p>
                  </div>
                  
                  <div className="text-post-actions">
                    <button 
                      className={`like-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                      onClick={() => handleToggleLike(post.id)}
                    >
                      {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes}
                    </button>
                    <button 
                      onClick={() => handleGenerateComment(post.id)}
                      disabled={generatingComment === post.id}
                    >
                      {generatingComment === post.id ? '💭 Generating...' : '💬 Comment'}
                    </button>
                    {postComments.length > 0 && (
                      <button 
                        className="toggle-comments-btn"
                        onClick={() => toggleComments(post.id)}
                      >
                        {isCommentsExpanded ? '🔽' : '▶️'} {postComments.length} comment{postComments.length !== 1 ? 's' : ''}
                      </button>
                    )}
                  </div>

                  <div className="text-post-footer">
                    <span className="text-post-timestamp">{post.timestamp}</span>
                  </div>

                  {/* Comments section */}
                  {postComments.length > 0 && isCommentsExpanded && (
                    <div className="comments-section">
                      {postComments.map(comment => (
                        <Comment 
                          key={comment.id} 
                          comment={comment} 
                          character={getCharacterById(comment.userId)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;