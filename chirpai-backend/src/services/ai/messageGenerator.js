const openai = require('../../config/openai');
const { getCharacterPersonalities } = require('../characterService');
const rateLimitService = require('../rateLimitService');
const settings = require('../../config/settings');
const tokenUtils = require('./tokenUtils');

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
    const truncatedHistory = tokenUtils.truncateContext(conversationHistory, aiConfig.contextTokens * 0.6); // Use 60% of context for history
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

module.exports = {
  generateDirectMessage
};