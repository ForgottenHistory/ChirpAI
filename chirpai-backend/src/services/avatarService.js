const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const generateAvatarPrompt = (characterId) => {
  const prompts = {
    1: { // Sakura - artistic style
      style: "1girl, solo, anime, kawaii, cute, pink hair, long hair, portrait, headshot, digital art style, pastel colors, happy expression, detailed face, high quality, masterpiece, profile picture style",
      negative: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple girls, nsfw, body, torso"
    },
    2: { // Yuki - cyberpunk/gaming style  
      style: "1girl, solo, anime, cyberpunk, blue hair, short hair, portrait, headshot, tech aesthetic, neon lights, cool expression, detailed face, high quality, masterpiece, profile picture style",
      negative: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple girls, nsfw, body, torso"
    },
    3: { // Luna - mystical/night style
      style: "1girl, solo, anime, mystical, purple hair, long hair, portrait, headshot, ethereal, dreamy atmosphere, magical, serene expression, detailed face, high quality, masterpiece, profile picture style",
      negative: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple girls, nsfw, body, torso"
    }
  };

  return prompts[characterId] || prompts[1];
};

const generateAvatar = async (characterId) => {
  const promptData = generateAvatarPrompt(characterId);
  const avatarId = uuidv4();
  
  console.log(`[${new Date().toISOString()}] Generating avatar for character ${characterId}`);
  console.log(`Avatar prompt: ${promptData.style}`);
  
  const payload = {
    prompt: promptData.style,
    negative_prompt: promptData.negative,
    steps: 30, // Higher steps for better quality avatars
    width: 512, // Smaller size for avatars
    height: 512,
    cfg_scale: 7,
    sampler_name: "Euler a",
    n_iter: 1,
    batch_size: 1
  };

  const response = await fetch('http://localhost:7860/sdapi/v1/txt2img', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Automatic1111 API error: ${response.status} - ${errorText}`);
    throw new Error(`Automatic1111 API error: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.images || result.images.length === 0) {
    throw new Error('No images returned from Automatic1111');
  }

  // Save avatar to disk in avatars folder
  const imageBuffer = Buffer.from(result.images[0], 'base64');
  const filename = `avatar_${characterId}_${avatarId}.png`;
  
  // Create avatars folder if it doesn't exist
  const avatarsDir = path.join(__dirname, '../../avatars');
  await fs.ensureDir(avatarsDir);
  
  const filepath = path.join(avatarsDir, filename);
  await fs.writeFile(filepath, imageBuffer);
  
  console.log(`[${new Date().toISOString()}] Avatar saved: ${filename}`);
  console.log(`Avatar size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  
  const avatarUrl = `http://localhost:5000/avatars/${filename}`;
  
  return {
    avatarUrl,
    filename,
    characterId
  };
};

module.exports = {
  generateAvatar
};