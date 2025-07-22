import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useUser } from '../contexts/UserContext';

export const useMessagesPageState = () => {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();

  // Core state
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [showInbox, setShowInbox] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [cancelToken, setCancelToken] = useState(null);

  // Data loading functions
  const loadConversations = async () => {
    try {
      const conversationsResponse = await api.getConversations();
      setConversations(conversationsResponse.data);
    } catch (err) {
      console.error('Error refreshing inbox:', err);
    }
  };

  const loadConversation = async (charId) => {
    try {
      const conversationResponse = await api.getOrCreateConversation(charId);
      setConversation(conversationResponse.data);

      const messagesResponse = await api.getMessages(conversationResponse.data.id);
      const fetchedMessages = messagesResponse.data;
      setMessages(fetchedMessages);

      return fetchedMessages;
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
      return [];
    }
  };

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);

      await loadConversations();

      if (characterId) {
        await loadConversation(characterId);
      }
    } catch (err) {
      console.error('Error initializing data:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleConversationSelect = (selectedCharacterId) => {
    navigate(`/messages/${selectedCharacterId}`);
  };

  const handleBackToFeed = () => {
    navigate('/');
  };

  const handleNewConversation = () => {
    navigate('/');
  };

  // UI handlers
  const toggleInbox = () => {
    setShowInbox(!showInbox);
  };

  return {
    // State
    conversation,
    messages,
    conversations,
    loading,
    error,
    showInbox,
    selectedMessageId,
    cancelToken,
    currentUser,
    characterId,
    
    // Setters
    setConversation,
    setMessages,
    setConversations,
    setLoading,
    setError,
    setShowInbox,
    setSelectedMessageId,
    setCancelToken,
    
    // Data functions
    loadConversations,
    loadConversation,
    initializeData,
    
    // Handlers
    handleConversationSelect,
    handleBackToFeed,
    handleNewConversation,
    toggleInbox
  };
};