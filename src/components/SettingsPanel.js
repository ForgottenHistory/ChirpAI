import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ModelSelector from './ModelSelector';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const configsResponse = await api.getAllAIConfigs();
      setConfigs(configsResponse.data);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (type, field, value) => {
    // Parse numeric values appropriately
    let parsedValue = value;
    
    if (field === 'maxTokens' || field === 'contextTokens' || field === 'topK') {
      parsedValue = parseInt(value) || 0;
    } else if (field === 'temperature' || field === 'minP' || field === 'topP' || field === 'repetitionPenalty') {
      parsedValue = parseFloat(value) || 0;
    }
    
    setConfigs(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: parsedValue
      }
    }));
  };

  const saveConfig = async (type) => {
    try {
      setSaving(true);
      setError(null);
      
      await api.updateAIConfig(type, configs[type]);
      setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} settings saved successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetConfig = async (type) => {
    if (!window.confirm(`Reset ${type} settings to defaults?`)) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await api.resetAIConfig(type);
      setConfigs(prev => ({
        ...prev,
        [type]: response.data.config
      }));
      
      setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} settings reset to defaults!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error resetting config:', err);
      setError('Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  const renderConfigForm = (type) => {
    const config = configs[type];
    if (!config) return null;

    return (
      <div className="config-form">
        <div className="config-section">
          <h3>Model Settings</h3>
          
          <div className="form-group">
            <label>Model</label>
            <ModelSelector
              value={config.model}
              onChange={(modelId) => handleConfigChange(type, 'model', modelId)}
              disabled={saving}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Max Tokens</label>
              <input
                type="number"
                min="10"
                max="4000"
                value={config.maxTokens || ''}
                onChange={(e) => handleConfigChange(type, 'maxTokens', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Context Tokens</label>
              <input
                type="number"
                min="100"
                max="32000"
                value={config.contextTokens || ''}
                onChange={(e) => handleConfigChange(type, 'contextTokens', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>Generation Parameters</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Temperature: {config.temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => handleConfigChange(type, 'temperature', parseFloat(e.target.value))}
              />
              <small>Controls randomness (0 = deterministic, 2 = very random)</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Top P: {config.topP}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.topP}
                onChange={(e) => handleConfigChange(type, 'topP', parseFloat(e.target.value))}
              />
              <small>Nucleus sampling threshold</small>
            </div>
            
            <div className="form-group">
              <label>Min P: {config.minP}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.minP}
                onChange={(e) => handleConfigChange(type, 'minP', parseFloat(e.target.value))}
              />
              <small>Minimum probability threshold</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Top K: {config.topK}</label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={config.topK}
                onChange={(e) => handleConfigChange(type, 'topK', parseInt(e.target.value))}
              />
              <small>Top-k sampling limit (0 = disabled)</small>
            </div>
            
            <div className="form-group">
              <label>Repetition Penalty: {config.repetitionPenalty}</label>
              <input
                type="range"
                min="1"
                max="1.5"
                step="0.01"
                value={config.repetitionPenalty}
                onChange={(e) => handleConfigChange(type, 'repetitionPenalty', parseFloat(e.target.value))}
              />
              <small>Penalizes repetition</small>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h3>System Prompt</h3>
          <div className="form-group">
            <textarea
              value={config.systemPrompt}
              onChange={(e) => handleConfigChange(type, 'systemPrompt', e.target.value)}
              rows={4}
              placeholder="System prompt for the AI..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            className="reset-btn" 
            onClick={() => resetConfig(type)}
            disabled={saving}
          >
            Reset to Defaults
          </button>
          <button 
            className="save-btn" 
            onClick={() => saveConfig(type)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>AI Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {loading ? (
          <div className="loading">Loading settings...</div>
        ) : (
          <>
            <div className="settings-tabs">
              <button 
                className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </button>
              <button 
                className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                Comments
              </button>
              <button 
                className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                Messages
              </button>
            </div>

            <div className="settings-content">
              {renderConfigForm(activeTab)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;