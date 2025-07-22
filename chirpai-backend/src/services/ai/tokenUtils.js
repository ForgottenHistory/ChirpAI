// Helper function to count approximate tokens (rough estimate)
const estimateTokens = (text) => {
  // Rough approximation: 1 token ≈ 0.75 words ≈ 4 characters
  return Math.ceil(text.length / 4);
};

// Helper function to truncate context to fit within token limits
const truncateContext = (messages, maxContextTokens) => {
  let totalTokens = 0;
  const truncatedMessages = [];
  
  // Start from the most recent messages and work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const messageTokens = estimateTokens(messages[i].content);
    if (totalTokens + messageTokens > maxContextTokens) {
      break;
    }
    totalTokens += messageTokens;
    truncatedMessages.unshift(messages[i]);
  }
  
  return truncatedMessages;
};

// Calculate tokens for an entire conversation
const calculateConversationTokens = (messages) => {
  return messages.reduce((total, message) => {
    return total + estimateTokens(message.content);
  }, 0);
};

// Smart truncation that preserves important messages
const smartTruncateContext = (messages, maxContextTokens, preserveCount = 2) => {
  if (messages.length <= preserveCount) {
    return truncateContext(messages, maxContextTokens);
  }
  
  // Always preserve the most recent messages
  const recentMessages = messages.slice(-preserveCount);
  const olderMessages = messages.slice(0, -preserveCount);
  
  // Calculate tokens for recent messages
  const recentTokens = calculateConversationTokens(recentMessages);
  
  if (recentTokens >= maxContextTokens) {
    // If recent messages already exceed limit, just truncate them
    return truncateContext(recentMessages, maxContextTokens);
  }
  
  // Use remaining token budget for older messages
  const remainingTokens = maxContextTokens - recentTokens;
  const truncatedOlder = truncateContext(olderMessages, remainingTokens);
  
  return [...truncatedOlder, ...recentMessages];
};

module.exports = {
  estimateTokens,
  truncateContext,
  calculateConversationTokens,
  smartTruncateContext
};