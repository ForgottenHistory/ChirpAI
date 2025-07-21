import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="app">
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div>Loading ChirpAI...</div>
      </div>
    </div>
  );
};

export default LoadingScreen;