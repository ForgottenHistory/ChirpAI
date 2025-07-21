const { 
  getAllUsers, 
  getUserById, 
  getUserByUsername, 
  createUser, 
  updateUser, 
  deleteUser,
  getCurrentUser,
  setCurrentUser,
  getAdminMode,
  setAdminMode,
  getUserSession
} = require('../services/userService');

const getUsers = (req, res) => {
  try {
    const users = getAllUsers();
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar: user.avatar,
      bio: user.bio,
      followers_count: user.followers_count,
      following_count: user.following_count,
      is_admin: user.is_admin,
      created_at: user.created_at
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUser = (req, res) => {
  try {
    const { id } = req.params;
    const user = getUserById(parseInt(id));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar: user.avatar,
      bio: user.bio,
      followers_count: user.followers_count,
      following_count: user.following_count,
      is_admin: user.is_admin,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const createNewUser = (req, res) => {
  try {
    const { username, display_name, bio } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Check if username already exists
    const existingUser = getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    const userData = {
      username: username.toLowerCase().trim(),
      display_name: display_name || username,
      bio: bio || ''
    };
    
    const newUser = createUser(userData);
    
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      display_name: newUser.display_name,
      avatar: newUser.avatar,
      bio: newUser.bio,
      followers_count: newUser.followers_count,
      following_count: newUser.following_count,
      is_admin: newUser.is_admin
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const updateUserProfile = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = getUserById(parseInt(id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const success = updateUser(parseInt(id), updates);
    
    if (success) {
      const updatedUser = getUserById(parseInt(id));
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        display_name: updatedUser.display_name,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        followers_count: updatedUser.followers_count,
        following_count: updatedUser.following_count,
        is_admin: updatedUser.is_admin
      });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const removeUser = (req, res) => {
  try {
    const { id } = req.params;
    
    const user = getUserById(parseInt(id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const success = deleteUser(parseInt(id));
    
    if (success) {
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Session management endpoints
const getSession = (req, res) => {
  try {
    const session = getUserSession();
    const currentUser = getCurrentUser();
    const isAdminMode = getAdminMode();
    
    res.json({
      current_user: currentUser ? {
        id: currentUser.id,
        username: currentUser.username,
        display_name: currentUser.display_name,
        avatar: currentUser.avatar,
        bio: currentUser.bio,
        followers_count: currentUser.followers_count,
        following_count: currentUser.following_count,
        is_admin: currentUser.is_admin
      } : null,
      is_admin_mode: isAdminMode,
      session_data: session
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
};

const switchUser = (req, res) => {
  try {
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = getUserById(parseInt(user_id));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    setCurrentUser(parseInt(user_id));
    
    res.json({ 
      success: true, 
      message: `Switched to user: ${user.username}`,
      current_user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar: user.avatar,
        bio: user.bio,
        followers_count: user.followers_count,
        following_count: user.following_count,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Error switching user:', error);
    res.status(500).json({ error: 'Failed to switch user' });
  }
};

const toggleAdminMode = (req, res) => {
  try {
    const { is_admin_mode } = req.body;
    
    setAdminMode(Boolean(is_admin_mode));
    
    res.json({ 
      success: true, 
      is_admin_mode: Boolean(is_admin_mode),
      message: `Admin mode ${is_admin_mode ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Error toggling admin mode:', error);
    res.status(500).json({ error: 'Failed to toggle admin mode' });
  }
};

module.exports = {
  getUsers,
  getUser,
  createNewUser,
  updateUserProfile,
  removeUser,
  getSession,
  switchUser,
  toggleAdminMode
};