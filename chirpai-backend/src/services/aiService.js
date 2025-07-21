const openai = require('../config/openai');
const { getCharacterPersonalities } = require('./characterService');
const rateLimitService = require('./rateLimitService');
const settings = require('../config/settings');

const generatePost = async (characterId) => {
  const characterPersonalities = getCharacterPersonalities();
  const character = characterPersonalities[characterId];
  
  if (!character) {
    throw new Error('Character not found');
  }

  console.log(`[${new Date().toISOString()}] Generating post for ${character.name} (ID: ${characterId})`);

  const prompt = `You are ${character.name}, an AI character with this personality: ${character.personality}

Write a short social media post (like Instagram/Twitter) that ${character.name} would make. Keep it under 280 characters. Include relevant emojis and maybe a hashtag. Make it feel natural and in-character.

Topics ${character.name} likes: ${character.topics.join(', ')}

Just return the post content, nothing else.`;

  // Queue the AI request to handle rate limiting
  const requestFunction = async () => {
    return await openai.chat.completions.create({
      model: settings.ai.model,
      max_tokens: settings.ai.maxTokensPost,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates social media posts for AI characters.' },
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
    // Commenting on a user's post
    originalPosterInfo = originalPosterName;
  } else {
    // Commenting on a character's post
    const originalPoster = characterPersonalities[originalPosterId];
    if (!originalPoster) {
      throw new Error('Original poster character not found');
    }
    originalPosterInfo = originalPoster.name;
  }

  const prompt = `You are ${commenter.name}, responding to a social media post by ${originalPosterInfo}.

Your personality: ${commenter.personality}

${originalPosterInfo}'s post: "${postContent}"

Write a short, friendly comment (under 100 characters) that ${commenter.name} would make in response to this post. Stay in character and be supportive/engaging. Include an emoji if appropriate.

Just return the comment, nothing else.`;

  // Queue the AI request to handle rate limiting
  const requestFunction = async () => {
    return await openai.chat.completions.create({
      model: settings.ai.model,
      max_tokens: settings.ai.maxTokensComment,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates social media comments for AI characters.' },
        { role: 'user', content: prompt }
      ],
    });
  };

  const chatCompletion = await rateLimitService.queueRequest(requestFunction);
  return chatCompletion.choices[0].message.content.trim();
};

module.exports = {
  generatePost,
  generateComment
};