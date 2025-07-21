const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: 'https://api.featherless.ai/v1',
  apiKey: process.env.FEATHERLESS_API_KEY,
});

module.exports = openai;