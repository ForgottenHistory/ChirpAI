import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load session data on mount
  useEffect(() => {
    loadSession();
    loadUsers();
  }, []);

  const loadSession = async () => {
    try {
      const response = await api.getSession();
      console.log('Session loaded:', response.data);
      setCurrentUser(response.data.current_user);
      setIsAdminMode(response.data.is_admin_mode);
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const switchUser = async (userId) => {
    try {
      console.log('Switching to user ID:', userId);
      const response = await api.switchUser(userId);
      const newUser = response.data.current_user;
      console.log('Switched to user:', newUser);
      setCurrentUser(newUser);
      
      // Reload session to get updated admin mode state
      await loadSession();
      
      console.log('User switch complete');
      return response.data;
    } catch (error) {
      console.error('Error switching user:', error);
      throw error;
    }
  };

  const toggleAdminMode = async () => {
    try {
      const newAdminMode = !isAdminMode;
      await api.toggleAdminMode(newAdminMode);
      setIsAdminMode(newAdminMode);
      console.log('Admin mode:', newAdminMode ? 'enabled' : 'disabled');
      return newAdminMode;
    } catch (error) {
      console.error('Error toggling admin mode:', error);
      throw error;
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await api.createUser(userData);
      const newUser = response.data;
      setUsers(prev => [...prev, newUser]);
      console.log('Created user:', newUser.username);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUserProfile = async (userId, updates) => {
    try {
      const response = await api.updateUser(userId, updates);
      const updatedUser = response.data;
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(updatedUser);
      }
      
      console.log('Updated user:', updatedUser.username);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // If deleted user was current user, switch to admin
      if (currentUser && currentUser.id === userId) {
        const adminUser = users.find(user => user.is_admin);
        if (adminUser) {
          await switchUser(adminUser.id);
        }
      }
      
      console.log('Deleted user:', userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  const value = {
    currentUser,
    isAdminMode,
    users,
    loading,
    switchUser,
    toggleAdminMode,
    createUser,
    updateUserProfile,
    deleteUser,
    getUserById,
    loadSession,
    loadUsers
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};