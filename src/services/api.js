import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
  // Characters
  getCharacters: () => axios.get(`${API_BASE_URL}/characters`),
  updateAvatar: (characterId, avatarUrl) => 
    axios.post(`${API_BASE_URL}/update-avatar`, { characterId, avatarUrl }),
  
  // Posts
  getPosts: () => axios.get(`${API_BASE_URL}/posts`),
  generatePost: (characterId, includeImage = false) => 
    axios.post(`${API_BASE_URL}/generate-post`, { characterId, includeImage }),
  toggleLike: (postId) => 
    axios.post(`${API_BASE_URL}/toggle-like`, { postId }),
  
  // Comments
  generateComment: (postContent, commenterCharacterId, originalPosterId, postId) =>
    axios.post(`${API_BASE_URL}/generate-comment`, {
      postContent,
      commenterCharacterId,
      originalPosterId,
      postId
    }),
  getComments: (postId) => axios.get(`${API_BASE_URL}/comments/${postId}`),
  
  // Images
  generateImage: (characterId, postContent) =>
    axios.post(`${API_BASE_URL}/generate-image`, { characterId, postContent }),
  
  // Avatars
  generateAvatar: (characterId) =>
    axios.post(`${API_BASE_URL}/generate-avatar`, { characterId }),
  
  // Scheduler
  startScheduler: () => axios.post(`${API_BASE_URL}/scheduler/start`),
  stopScheduler: () => axios.post(`${API_BASE_URL}/scheduler/stop`),
  getSchedulerStatus: () => axios.get(`${API_BASE_URL}/scheduler/status`),
  updateSchedulerConfig: (config) => axios.post(`${API_BASE_URL}/scheduler/config`, config),
  
  // Test
  test: () => axios.get(`${API_BASE_URL}/test`)
};