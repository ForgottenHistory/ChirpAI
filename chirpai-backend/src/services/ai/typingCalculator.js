// Calculate realistic typing time based on message content
const calculateTypingTime = (messageContent) => {
  // Base typing speed: ~60 WPM (words per minute) = 1 word per second
  // But AI should "think" a bit, so we'll make it slower
  const wordsPerSecond = 0.8;
  const wordCount = messageContent.trim().split(/\s+/).length;
  
  // Calculate time based on word count
  const baseTime = (wordCount / wordsPerSecond) * 1000; // Convert to milliseconds
  
  // Add some randomness (±30%)
  const randomFactor = 0.7 + Math.random() * 0.6;
  let typingTime = baseTime * randomFactor;
  
  // Set reasonable bounds (1-8 seconds)
  typingTime = Math.max(1000, Math.min(8000, typingTime));
  
  console.log(`[TYPING] Calculated typing time: ${typingTime}ms for ${wordCount} words`);
  return typingTime;
};

// Calculate typing time with character-specific speeds
const calculateCharacterTypingTime = (messageContent, characterId) => {
  const baseTime = calculateTypingTime(messageContent);
  
  // Character-specific typing speed modifiers
  const characterModifiers = {
    1: 1.2, // Sakura - slightly slower (artistic type)
    2: 0.8, // Yuki - faster (gamer/programmer)
    3: 1.1  // Luna - slightly slower (thoughtful type)
  };
  
  const modifier = characterModifiers[characterId] || 1.0;
  return Math.round(baseTime * modifier);
};

// Calculate delay before starting to type (thinking time)
const calculateThinkingTime = (messageContent, characterId) => {
  const wordCount = messageContent.trim().split(/\s+/).length;
  
  // Base thinking time: 200ms per word
  const baseThinkingTime = wordCount * 200;
  
  // Character-specific thinking modifiers
  const characterModifiers = {
    1: 1.3, // Sakura - more thoughtful
    2: 0.7, // Yuki - quick responses
    3: 1.5  // Luna - very thoughtful
  };
  
  const modifier = characterModifiers[characterId] || 1.0;
  let thinkingTime = baseThinkingTime * modifier;
  
  // Add randomness and set bounds (500ms - 3000ms)
  const randomFactor = 0.8 + Math.random() * 0.4;
  thinkingTime = thinkingTime * randomFactor;
  thinkingTime = Math.max(500, Math.min(3000, thinkingTime));
  
  return Math.round(thinkingTime);
};

module.exports = {
  calculateTypingTime,
  calculateCharacterTypingTime,
  calculateThinkingTime
};