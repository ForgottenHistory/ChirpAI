export const formatRelativeTime = (timestamp) => {
  // Handle invalid timestamps
  if (!timestamp) {
    return 'unknown time';
  }
  
  // If timestamp is already a relative time string (like "2h ago"), return it as is
  if (typeof timestamp === 'string' && timestamp.match(/^\d+[smhdwoy]( ago)?$/)) {
    return timestamp;
  }
  
  try {
    const now = new Date();
    const postTime = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(postTime.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'unknown time';
    }
    
    const diffMs = now - postTime;
    
    // If timestamp is in the future or just created, show "just now"
    if (diffMs < 1000) {
      return 'just now';
    }
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else if (diffWeeks < 4) {
      return `${diffWeeks}w`;
    } else if (diffMonths < 12) {
      return `${diffMonths}mo`;
    } else {
      return `${diffYears}y`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', timestamp, error);
    return 'unknown time';
  }
};

export const formatAbsoluteTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If same year, don't show year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
};

export const formatFullDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};