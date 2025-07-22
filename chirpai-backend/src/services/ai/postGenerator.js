const openai = require('../../config/openai');
const { getCharacterPersonalities } = require('../characterService');
const rateLimitService = require('../rateLimitService');
const settings = require('../../config/settings');

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

module.exports = {
  generatePost
};