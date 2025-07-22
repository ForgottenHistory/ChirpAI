const openai = require('../../config/openai');
const { getCharacterPersonalities } = require('../characterService');
const rateLimitService = require('../rateLimitService');
const settings = require('../../config/settings');

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

module.exports = {
  generateComment
};