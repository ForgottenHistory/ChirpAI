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
  onDelete,
  onForceResponse,
  isGenerating = false,
  generatingVariation = false,
  deleting = false,
  forcingResponse = false
}) => {
  // Don't show buttons if no message is selected or if generating
  if (!selectedMessageId || isGenerating || forcingResponse) {
    return null;
  }

  return (
    <div className="message-floating-buttons">
      {/* Swipe Left Button */}
      <button
        className={`message-floating-btn swipe-btn ${!swipeInfo.canSwipeLeft ? 'disabled' : ''}`}
        onClick={() => swipeInfo.canSwipeLeft && onSwipeLeft()}
        disabled={!swipeInfo.canSwipeLeft || deleting || forcingResponse}
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
        disabled={!swipeInfo.canSwipeRight || deleting || forcingResponse}
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
        disabled={generatingVariation || deleting || forcingResponse}
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
        disabled={deleting || forcingResponse}
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
        disabled={deleting || forcingResponse}
        title="Continue this message"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 17L18 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 17L11 12L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Force AI Response Button */}
      <button
        className={`message-floating-btn force-response-btn ${forcingResponse ? 'forcing' : ''}`}
        onClick={onForceResponse}
        disabled={forcingResponse || deleting}
        title={forcingResponse ? "Forcing AI response..." : "Force AI to send a message"}
      >
        {forcingResponse ? (
          <div className="generating-spinner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
              <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Delete From Here Button */}
      <button
        className={`message-floating-btn delete-btn ${deleting ? 'deleting' : ''}`}
        onClick={onDelete}
        disabled={deleting || forcingResponse}
        title={deleting ? "Deleting..." : "Delete this message and everything after it"}
      >
        {deleting ? (
          <div className="generating-spinner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
              <path d="M12 2A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default MessageFloatingButtons;