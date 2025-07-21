import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const Header = ({ onGeneratePost, onGenerateAvatars, generating, generatingAvatars, isConnected }) => {
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [schedulerLoading, setSchedulerLoading] = useState(false);
  const [followerServiceRunning, setFollowerServiceRunning] = useState(false);
  const [followerServiceLoading, setFollowerServiceLoading] = useState(false);

  useEffect(() => {
    // Check both services status on component mount
    checkSchedulerStatus();
    checkFollowerServiceStatus();
  }, []);

  const checkSchedulerStatus = async () => {
    try {
      const response = await api.getSchedulerStatus();
      setSchedulerRunning(response.data.isRunning);
    } catch (error) {
      console.error('Error checking scheduler status:', error);
    }
  };

  const checkFollowerServiceStatus = async () => {
    try {
      const response = await api.getFollowerServiceStatus();
      setFollowerServiceRunning(response.data.isRunning);
    } catch (error) {
      console.error('Error checking follower service status:', error);
    }
  };

  const toggleScheduler = async () => {
    setSchedulerLoading(true);
    try {
      if (schedulerRunning) {
        await api.stopScheduler();
        setSchedulerRunning(false);
        console.log('Scheduler stopped');
      } else {
        await api.startScheduler();
        setSchedulerRunning(true);
        console.log('Scheduler started');
      }
    } catch (error) {
      console.error('Error toggling scheduler:', error);
      alert('Failed to toggle scheduler');
    } finally {
      setSchedulerLoading(false);
    }
  };

  const toggleFollowerService = async () => {
    setFollowerServiceLoading(true);
    try {
      if (followerServiceRunning) {
        await api.stopFollowerService();
        setFollowerServiceRunning(false);
        console.log('Follower service stopped');
      } else {
        await api.startFollowerService();
        setFollowerServiceRunning(true);
        console.log('Follower service started');
      }
    } catch (error) {
      console.error('Error toggling follower service:', error);
      alert('Failed to toggle follower service');
    } finally {
      setFollowerServiceLoading(false);
    }
  };

  const triggerFollowerUpdate = async () => {
    try {
      await api.triggerFollowerUpdate();
      console.log('Follower update triggered');
    } catch (error) {
      console.error('Error triggering follower update:', error);
      alert('Failed to trigger follower update');
    }
  };

  return (
    <header className="header">
      <div className="header-top">
        <Link to="/" className="title-link">
          <h1>ChirpAI</h1>
        </Link>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Live' : '🔴 Offline'}
          </span>
        </div>
      </div>
      <div className="generate-buttons">
        <button 
          className="generate-btn" 
          onClick={() => onGeneratePost(false)}
          disabled={generating}
        >
          {generating ? '🤖 Generating...' : '✨ Generate Post'}
        </button>
        <button 
          className="generate-btn image-btn" 
          onClick={() => onGeneratePost(true)}
          disabled={generating}
        >
          {generating ? '🎨 Generating...' : '🎨 Generate with Image'}
        </button>
        <button 
          className="generate-btn avatar-btn" 
          onClick={onGenerateAvatars}
          disabled={generatingAvatars}
        >
          {generatingAvatars ? '👤 Generating...' : '👤 Generate Avatars'}
        </button>
        <button 
          className={`generate-btn scheduler-btn ${schedulerRunning ? 'running' : ''}`}
          onClick={toggleScheduler}
          disabled={schedulerLoading}
        >
          {schedulerLoading 
            ? '⏳ Loading...' 
            : schedulerRunning 
              ? '⏸️ Stop Auto-Posts' 
              : '▶️ Start Auto-Posts'
          }
        </button>
        <button 
          className={`generate-btn follower-btn ${followerServiceRunning ? 'running' : ''}`}
          onClick={toggleFollowerService}
          disabled={followerServiceLoading}
        >
          {followerServiceLoading 
            ? '⏳ Loading...' 
            : followerServiceRunning 
              ? '⏸️ Stop Followers' 
              : '👥 Start Followers'
          }
        </button>
        <button 
          className="generate-btn trigger-btn"
          onClick={triggerFollowerUpdate}
          title="Trigger follower update now"
        >
          📊 Update Now
        </button>
      </div>
    </header>
  );
};

export default Header;