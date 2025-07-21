import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { api } from './services/api';
import { usePosts } from './hooks/usePosts';
import { useComments } from './hooks/useComments';
import { useWebSocket } from './hooks/useWebSocket';
import { UserProvider } from './contexts/UserContext';
import Header from './components/Header';
import Feed from './components/Feed';
import UserProfile from './components/UserProfile';

// Main App Content Component (everything except Router and UserProvider)
function AppContent() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingComment, setGeneratingComment] = useState(null);
  const [generatingAvatars, setGeneratingAvatars] = useState(false);

  const { posts, likedPosts, addPost, toggleLike, setPosts } = usePosts([]);
  const { comments, addComment, setComments } = useComments();
  const { isConnected, subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [charactersResponse, postsResponse] = await Promise.all([
          api.getCharacters(),
          api.getPosts()
        ]);
        
        setCharacters(charactersResponse.data);
        setPosts(postsResponse.data);
        
        // Load comments for all posts
        const commentsPromises = postsResponse.data.map(post => 
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
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    if (!isConnected) return;

    const handleNewPost = (payload) => {
      console.log('[WebSocket] New post received:', payload);
      const newPost = payload.data;
      addPost(newPost);
      
      // Show notification (optional)
      if (Notification.permission === 'granted') {
        new Notification(`New post by ${newPost.character.name}`, {
          body: newPost.content.substring(0, 100) + '...',
          icon: newPost.character.avatar
        });
      }
    };

    const handleNewComment = (payload) => {
      console.log('[WebSocket] New comment received:', payload);
      const newComment = payload.data;
      addComment(newComment.postId, newComment);
    };

    const handleLikeUpdate = (payload) => {
      console.log('[WebSocket] Like update received:', payload);
      // Update post likes without affecting user's like state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === payload.data.postId 
            ? { ...post, likes: payload.data.likes }
            : post
        )
      );
    };

    const handleSchedulerStatus = (payload) => {
      console.log('[WebSocket] Scheduler status update:', payload);
    };

    // Subscribe to events
    subscribe('newPost', handleNewPost);
    subscribe('newComment', handleNewComment);
    subscribe('likeUpdate', handleLikeUpdate);
    subscribe('schedulerStatus', handleSchedulerStatus);

    // Cleanup subscriptions
    return () => {
      unsubscribe('newPost', handleNewPost);
      unsubscribe('newComment', handleNewComment);
      unsubscribe('likeUpdate', handleLikeUpdate);
      unsubscribe('schedulerStatus', handleSchedulerStatus);
    };
  }, [isConnected, subscribe, unsubscribe, addPost, addComment, setPosts]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleGeneratePost = async (includeImage = false) => {
    if (generating) return;
    
    setGenerating(true);
    try {
      const randomCharacterId = Math.floor(Math.random() * 3) + 1;
      const response = await api.generatePost(randomCharacterId, includeImage);

      const newPost = {
        id: response.data.id,
        userId: response.data.characterId,
        content: response.data.content,
        timestamp: response.data.timestamp,
        likes: response.data.likes,
        imageUrl: response.data.imageUrl
      };

      addPost(newPost);
    } catch (error) {
      console.error('Error generating post:', error);
      alert('Failed to generate post. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAvatars = async () => {
    if (generatingAvatars) return;
    
    setGeneratingAvatars(true);
    try {
      console.log('Generating avatars for all characters...');
      
      for (let i = 1; i <= 3; i++) {
        try {
          const response = await api.generateAvatar(i);
          
          setCharacters(prevCharacters => 
            prevCharacters.map(char => 
              char.id === i 
                ? { ...char, avatar: response.data.avatarUrl }
                : char
            )
          );
          
          console.log(`Generated avatar for character ${i}`);
        } catch (error) {
          console.error(`Failed to generate avatar for character ${i}:`, error);
        }
      }
    } catch (error) {
      console.error('Error generating avatars:', error);
      alert('Failed to generate avatars. Please try again.');
    } finally {
      setGeneratingAvatars(false);
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

      addComment(postId, newComment);
    } catch (error) {
      console.error('Error generating comment:', error);
      alert('Failed to generate comment. Please try again.');
    } finally {
      setGeneratingComment(null);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      await api.toggleLike(postId);
      toggleLike(postId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        onGeneratePost={handleGeneratePost}
        onGenerateAvatars={handleGenerateAvatars}
        generating={generating}
        generatingAvatars={generatingAvatars}
        isConnected={isConnected}
      />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <Feed
              posts={posts}
              characters={characters}
              likedPosts={likedPosts}
              comments={comments}
              onLike={handleToggleLike}
              onComment={handleGenerateComment}
              generatingComment={generatingComment}
            />
          } />
          <Route path="/user/:userId" element={<UserProfile />} />
        </Routes>
      </main>
    </div>
  );
}

// Main App Component with Router and UserProvider
function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;