// src/components/MessageFloatingButtons.js
import React from 'react';
import './MessageFloatingButtons.css';

const MessageFloatingButtons = ({ 
  selectedMessageId, 
  swipeInfo, 
  onSwipeLeft, 
  onSwipeRight,
  onGenerateVariation,
  onRegenerate,
  onContinue,
  isGenerating = false,
  generatingVariation = false
}) => {
  // Don't show buttons if no message is selected or if generating
  if (!selectedMessageId || isGenerating) {
    return null;
  }

  return (
    <div className="message-floating-buttons">
      {/* Swipe Left Button */}
      <button
        className={`message-floating-btn swipe-btn ${!swipeInfo.canSwipeLeft ? 'disabled' : ''}`}
        onClick={() => swipeInfo.canSwipeLeft && onSwipeLeft()}
        disabled={!swipeInfo.canSwipeLeft}
        title="Previous variation"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Variation Counter */}
      {swipeInfo.hasVariations && (
        <div className="variation-counter">
          {swipeInfo.currentIndex + 1} / {swipeInfo.totalVariations}
        </div>
      )}

      {/* Swipe Right Button */}
      <button
        className={`message-floating-btn swipe-btn ${!swipeInfo.canSwipeRight ? 'disabled' : ''}`}
        onClick={() => swipeInfo.canSwipeRight && onSwipeRight()}
        disabled={!swipeInfo.canSwipeRight}
        title="Next variation"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Generate New Variation Button */}
      <button
        className={`message-floating-btn generate-variation-btn ${generatingVariation ? 'generating' : ''}`}
        onClick={onGenerateVariation}
        disabled={generatingVariation}
        title={generatingVariation ? "Generating..." : "Generate new variation"}
      >
        {generatingVariation ? (
          <div className="generating-spinner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
              <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Regenerate Button */}
      <button
        className="message-floating-btn regenerate-btn"
        onClick={onRegenerate}
        title="Regenerate message (clears all variations)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 2V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12A9 9 0 0 1 15 3L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 22V16H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12A9 9 0 0 1 9 21L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Continue Button */}
      <button
        className="message-floating-btn continue-btn"
        onClick={onContinue}
        title="Continue this message"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 17L18 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 17L11 12L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default MessageFloatingButtons;