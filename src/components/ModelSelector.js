import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import './ModelSelector.css';

const ModelSelector = ({ value, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const pageSize = 15;

  useEffect(() => {
    if (isOpen) {
      searchModels('', 1);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Find and set the selected model details
    if (value) {
      const found = models.find(model => model.id === value);
      if (found) {
        setSelectedModel(found);
      } else {
        // If not in current results, create a basic model object
        setSelectedModel({ id: value, name: value });
      }
    }
  }, [value, models]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchModels = async (query = searchQuery, page = currentPage) => {
    setLoading(true);
    try {
      const response = await api.searchAvailableModels(query, page, pageSize);
      setModels(response.data.models);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error searching models:', error);
      // Fallback to basic models if API fails
      setModels([
        { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B Instruct", category: "llama" },
        { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B Instruct", category: "llama" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    
    // Debounce search
    clearTimeout(window.modelSearchTimeout);
    window.modelSearchTimeout = setTimeout(() => {
      searchModels(query, 1);
    }, 300);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    onChange(model.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      searchModels(searchQuery, newPage);
    }
  };

  const formatContextLength = (length) => {
    if (length >= 1000000) {
      return `${(length / 1000000).toFixed(1)}M`;
    } else if (length >= 1000) {
      return `${(length / 1000).toFixed(0)}k`;
    }
    return length.toString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      claude: '#ff6b6b',
      gpt: '#4ecdc4',
      gemini: '#45b7d1',
      llama: '#96ceb4',
      mistral: '#feca57',
      other: '#ddd'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="model-selector" ref={dropdownRef}>
      <button
        type="button"
        className={`model-selector-button ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="selected-model">
          {selectedModel ? (
            <>
              <div className="model-name">{selectedModel.name}</div>
              <div className="model-id">{selectedModel.id}</div>
            </>
          ) : (
            <div className="model-placeholder">Select a model...</div>
          )}
        </div>
        <div className="dropdown-arrow">
          {isOpen ? '▲' : '▼'}
        </div>
      </button>

      {isOpen && (
        <div className="model-dropdown">
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search models..."
              className="model-search"
            />
          </div>

          <div className="models-list">
            {loading ? (
              <div className="models-loading">Searching models...</div>
            ) : models.length === 0 ? (
              <div className="models-empty">
                {searchQuery ? 'No models found' : 'No models available'}
              </div>
            ) : (
              models.map((model) => (
                <div
                  key={model.id}
                  className={`model-item ${selectedModel?.id === model.id ? 'selected' : ''}`}
                  onClick={() => handleModelSelect(model)}
                >
                  <div className="model-item-main">
                    <div className="model-item-header">
                      <span className="model-item-name">{model.name}</span>
                      <span 
                        className="model-category"
                        style={{ backgroundColor: getCategoryColor(model.category) }}
                      >
                        {model.category}
                      </span>
                    </div>
                    <div className="model-item-id">{model.id}</div>
                    <div className="model-item-details">
                      <span>Context: {formatContextLength(model.context_length)}</span>
                      <span>Max tokens: {formatContextLength(model.max_completion_tokens)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPreviousPage || loading}
              >
                ← Previous
              </button>
              
              <div className="page-info">
                <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                <span className="total-items">({pagination.totalItems} models)</span>
              </div>
              
              <button
                className="page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;