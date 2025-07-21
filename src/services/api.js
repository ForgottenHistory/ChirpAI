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

  // Follower service
  startFollowerService: () => axios.post(`${API_BASE_URL}/followers/start`),
  stopFollowerService: () => axios.post(`${API_BASE_URL}/followers/stop`),
  getFollowerServiceStatus: () => axios.get(`${API_BASE_URL}/followers/status`),
  updateFollowerServiceConfig: (config) => axios.post(`${API_BASE_URL}/followers/config`, config),
  triggerFollowerUpdate: () => axios.post(`${API_BASE_URL}/followers/trigger`),

  // User management
  getUsers: () => axios.get(`${API_BASE_URL}/users`),
  getUser: (userId) => axios.get(`${API_BASE_URL}/users/${userId}`),
  createUser: (userData) => axios.post(`${API_BASE_URL}/users`, userData),
  updateUser: (userId, updates) => axios.put(`${API_BASE_URL}/users/${userId}`, updates),
  deleteUser: (userId) => axios.delete(`${API_BASE_URL}/users/${userId}`),

  // Session management
  getSession: () => axios.get(`${API_BASE_URL}/session`),
  switchUser: (userId) => axios.post(`${API_BASE_URL}/session/switch-user`, { user_id: userId }),
  toggleAdminMode: (isAdminMode) => axios.post(`${API_BASE_URL}/session/admin-mode`, { is_admin_mode: isAdminMode }),

  // Test
  test: () => axios.get(`${API_BASE_URL}/test`)
};