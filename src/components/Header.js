import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Header = ({ onGeneratePost, onGenerateAvatars, generating, generatingAvatars, isConnected }) => {
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [schedulerLoading, setSchedulerLoading] = useState(false);

  useEffect(() => {
    // Check scheduler status on component mount
    checkSchedulerStatus();
  }, []);

  const checkSchedulerStatus = async () => {
    try {
      const response = await api.getSchedulerStatus();
      setSchedulerRunning(response.data.isRunning);
    } catch (error) {
      console.error('Error checking scheduler status:', error);
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

  return (
    <header className="header">
      <div className="header-top">
        <h1>ChirpAI</h1>
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
      </div>
    </header>
  );
};

export default Header;