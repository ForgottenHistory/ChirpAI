const openai = require('../config/openai');
const { getCharacterPersonalities } = require('./characterService');
const rateLimitService = require('./rateLimitService');
const settings = require('../config/settings');

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

const generatePost = async (characterId) => {
  const characterPersonalities = getCharacterPersonalities();
  const character = characterPersonalities[characterId];
  
  if (!character) {
    throw new Error('Character not found');
  }

  console.log(`[${new Date().toISOString()}] Generating post for ${character.name} (ID: ${characterId})`);

  const aiConfig = settings.ai.posts;
  
  const prompt = `You are ${character.name}, an AI character with this personality: ${character.personality}

Write a short social media post (like Instagram/Twitter) that ${character.name} would make. Keep it under 280 characters. Include relevant emojis and maybe a hashtag. Make it feel natural and in-character.

Topics ${character.name} likes: ${character.topics.join(', ')}

Just return the post content, nothing else.`;

  // Queue the AI request to handle rate limiting
  const requestFunction = async () => {
    return await openai.chat.completions.create({
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      top_p: aiConfig.topP,
      top_k: aiConfig.topK,
      min_p: aiConfig.minP,
      repetition_penalty: aiConfig.repetitionPenalty,
      messages: [
        { role: 'system', content: aiConfig.systemPrompt },
        { role: 'user', content: prompt }
      ],
    });
  };

  const chatCompletion = await rateLimitService.queueRequest(requestFunction);
  const postContent = chatCompletion.choices[0].message.content.trim();
  console.log(`Generated post: "${postContent}"`);
  
  return postContent;
};

const generateComment = async (postContent, commenterCharacterId, originalPosterId, originalPosterName = null, originalPosterType = 'character') => {
  const characterPersonalities = getCharacterPersonalities();
  const commenter = characterPersonalities[commenterCharacterId];
  
  if (!commenter) {
    throw new Error('Commenter character not found');
  }

  let originalPosterInfo;
  
  if (originalPosterType === 'user') {
    originalPosterInfo = originalPosterName;
  } else {
    const originalPoster = characterPersonalities[originalPosterId];
    if (!originalPoster) {
      throw new Error('Original poster character not found');
    }
    originalPosterInfo = originalPoster.name;
  }

  const aiConfig = settings.ai.comments;

  const prompt = `You are ${commenter.name}, responding to a social media post by ${originalPosterInfo}.

Your personality: ${commenter.personality}

${originalPosterInfo}'s post: "${postContent}"

Write a short, friendly comment (under 100 characters) that ${commenter.name} would make in response to this post. Stay in character and be supportive/engaging. Include an emoji if appropriate.

Just return the comment, nothing else.`;

  // Queue the AI request to handle rate limiting
  const requestFunction = async () => {
    return await openai.chat.completions.create({
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      top_p: aiConfig.topP,
      top_k: aiConfig.topK,
      min_p: aiConfig.minP,
      repetition_penalty: aiConfig.repetitionPenalty,
      messages: [
        { role: 'system', content: aiConfig.systemPrompt },
        { role: 'user', content: prompt }
      ],
    });
  };

  const chatCompletion = await rateLimitService.queueRequest(requestFunction);
  return chatCompletion.choices[0].message.content.trim();
};

const generateDirectMessage = async (characterId, userName, userMessage, conversationHistory = []) => {
  const characterPersonalities = getCharacterPersonalities();
  const character = characterPersonalities[characterId];
  
  if (!character) {
    throw new Error('Character not found');
  }

  console.log(`[DM] Generating response for ${character.name} to ${userName}`);

  const aiConfig = settings.ai.messages;
  
  // Build conversation context from recent messages, respecting token limits
  let contextText = '';
  if (conversationHistory.length > 0) {
    const truncatedHistory = truncateContext(conversationHistory, aiConfig.contextTokens * 0.6); // Use 60% of context for history
    if (truncatedHistory.length > 0) {
      contextText = '\n\nRecent conversation:\n';
      truncatedHistory.forEach(msg => {
        const sender = msg.sender_type === 'user' ? userName : character.name;
        contextText += `${sender}: ${msg.content}\n`;
      });
    }
  }

  const prompt = `You are ${character.name}, having a private conversation with ${userName}.

Your personality: ${character.personality}
${contextText}
${userName} just sent you this message: "${userMessage}"

Write a personal, friendly response that ${character.name} would send in a direct message. Keep it conversational and natural, like you're chatting with a friend. Reference the conversation history if relevant. Don't be overly formal. You can ask questions, share thoughts, or react to what they said. Keep it under 200 characters.

Just return the message response, nothing else.`;

  // Queue the AI request to handle rate limiting
  const requestFunction = async () => {
    return await openai.chat.completions.create({
      model: aiConfig.model,
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      top_p: aiConfig.topP,
      top_k: aiConfig.topK,
      min_p: aiConfig.minP,
      repetition_penalty: aiConfig.repetitionPenalty,
      messages: [
        { role: 'system', content: aiConfig.systemPrompt },
        { role: 'user', content: prompt }
      ],
    });
  };

  const chatCompletion = await rateLimitService.queueRequest(requestFunction);
  const response = chatCompletion.choices[0].message.content.trim();
  
  console.log(`[DM] ${character.name} responded: "${response}"`);
  return response;
};

// Get current AI configuration for a specific type
const getAIConfig = (type) => {
  const validTypes = ['posts', 'comments', 'messages'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid AI config type. Must be one of: ${validTypes.join(', ')}`);
  }
  return settings.ai[type];
};

// Update AI configuration for a specific type
const updateAIConfig = (type, updates) => {
  const validTypes = ['posts', 'comments', 'messages'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid AI config type. Must be one of: ${validTypes.join(', ')}`);
  }
  
  const currentConfig = settings.ai[type];
  const newConfig = { ...currentConfig, ...updates };
  
  // Update the settings
  settings.updateRuntime(`ai.${type}`, newConfig);
  
  console.log(`[AI_CONFIG] Updated ${type} configuration:`, updates);
  return newConfig;
};

module.exports = {
  generatePost,
  generateComment,
  generateDirectMessage,
  getAIConfig,
  updateAIConfig,
  estimateTokens
};