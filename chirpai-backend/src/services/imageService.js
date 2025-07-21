const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const generateImagePrompt = (characterId, postContent) => {
  const prompts = {
    1: { // Sakura - artistic style
      style: "1girl, solo, anime, kawaii, cute, pink hair, long hair, digital art style, pastel colors, coffee, morning light, happy expression, detailed face, high quality, masterpiece",
      negative: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple girls, nsfw"
    },
    2: { // Yuki - cyberpunk/gaming style  
      style: "1girl, solo, anime, cyberpunk, gaming, neon lights, blue hair, short hair, tech aesthetic, computer, futuristic, cool expression, detailed face, high quality, masterpiece",
      negative: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple girls, nsfw"
    },
    3: { // Luna - mystical/night style
      style: "1girl, solo, anime, mystical, moonlight, purple hair, long hair, ethereal, night sky, stars, dreamy atmosphere, magical, serene expression, detailed face, high quality, masterpiece",
      negative: "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, multiple girls, nsfw"
    }
  };

  return prompts[characterId] || prompts[1];
};

const generateImage = async (characterId, postContent) => {
  const promptData = generateImagePrompt(characterId, postContent);
  const imageId = uuidv4();
  
  console.log(`[${new Date().toISOString()}] Generating image for character ${characterId}`);
  console.log(`Prompt: ${promptData.style}`);
  
  const payload = {
    prompt: promptData.style,
    negative_prompt: promptData.negative,
    steps: 25,
    width: 1024,
    height: 1024,
    cfg_scale: 6,
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

  // Save image to disk
  const imageBuffer = Buffer.from(result.images[0], 'base64');
  const filename = `${imageId}.png`;
  const filepath = path.join(__dirname, '../../images', filename);
  
  await fs.writeFile(filepath, imageBuffer);
  
  console.log(`[${new Date().toISOString()}] Image saved: ${filename}`);
  console.log(`Image size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB`);
  
  const imageUrl = `http://localhost:5000/images/${filename}`;
  
  return {
    imageUrl,
    filename,
    characterId
  };
};

module.exports = {
  generateImage
};