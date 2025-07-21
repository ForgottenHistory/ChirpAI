const fetch = require('node-fetch');

class FeatherlessService {
  constructor() {
    this.baseUrl = 'https://api.featherless.ai/v1';
    this.modelsCache = null;
    this.cacheExpiry = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
  }

  async fetchModels() {
    try {
      // Check cache first
      if (this.modelsCache && this.cacheExpiry && Date.now() < this.cacheExpiry) {
        console.log('[FEATHERLESS] Using cached models');
        return this.modelsCache;
      }

      console.log('[FEATHERLESS] Fetching models from API...');
      const response = await fetch(`${this.baseUrl}/models`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process and sort models
      const processedModels = data.data.map(model => ({
        id: model.id,
        name: model.name || model.id,
        model_class: model.model_class,
        context_length: model.context_length || 4096,
        max_completion_tokens: model.max_completion_tokens || 2048,
        // Add some categorization for better organization
        category: this.categorizeModel(model.id),
        provider: this.extractProvider(model.id)
      }));

      // Sort by popularity/category, then alphabetically
      const sortedModels = processedModels.sort((a, b) => {
        // Priority order for categories
        const categoryPriority = {
          'claude': 1,
          'gpt': 2,
          'gemini': 3,
          'llama': 4,
          'mistral': 5,
          'other': 6
        };

        const aPriority = categoryPriority[a.category] || 6;
        const bPriority = categoryPriority[b.category] || 6;

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }

        // Within same category, sort alphabetically
        return a.name.localeCompare(b.name);
      });

      // Cache the results
      this.modelsCache = sortedModels;
      this.cacheExpiry = Date.now() + this.cacheDuration;

      console.log(`[FEATHERLESS] Fetched ${sortedModels.length} models`);
      return sortedModels;

    } catch (error) {
      console.error('[FEATHERLESS] Error fetching models:', error);
      
      // Return fallback models if API fails
      return this.getFallbackModels();
    }
  }

  categorizeModel(modelId) {
    const id = modelId.toLowerCase();
    
    if (id.includes('claude')) return 'claude';
    if (id.includes('gpt') || id.includes('openai')) return 'gpt';
    if (id.includes('gemini') || id.includes('google')) return 'gemini';
    if (id.includes('llama') || id.includes('meta')) return 'llama';
    if (id.includes('mistral')) return 'mistral';
    
    return 'other';
  }

  extractProvider(modelId) {
    const parts = modelId.split('/');
    return parts.length > 1 ? parts[0] : 'unknown';
  }

  getFallbackModels() {
    return [
      {
        id: "meta-llama/llama-3.1-70b-instruct",
        name: "Llama 3.1 70B Instruct",
        model_class: "llama3-70b",
        context_length: 131072,
        max_completion_tokens: 4096,
        category: 'llama',
        provider: 'meta-llama'
      },
      {
        id: "meta-llama/llama-3.1-8b-instruct",
        name: "Llama 3.1 8B Instruct", 
        model_class: "llama3-8b",
        context_length: 131072,
        max_completion_tokens: 4096,
        category: 'llama',
        provider: 'meta-llama'
      },
      {
        id: "anthropic/claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet",
        model_class: "claude-3.5-sonnet",
        context_length: 200000,
        max_completion_tokens: 8192,
        category: 'claude',
        provider: 'anthropic'
      }
    ];
  }

  // Search models with pagination
  searchModels(models, query = '', page = 1, pageSize = 20) {
    let filteredModels = models;

    // Apply search filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filteredModels = models.filter(model => 
        model.name.toLowerCase().includes(searchTerm) ||
        model.id.toLowerCase().includes(searchTerm) ||
        model.provider.toLowerCase().includes(searchTerm) ||
        model.category.toLowerCase().includes(searchTerm)
      );
    }

    // Calculate pagination
    const totalItems = filteredModels.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedModels = filteredModels.slice(startIndex, endIndex);

    return {
      models: paginatedModels,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  // Clear cache (for testing or manual refresh)
  clearCache() {
    this.modelsCache = null;
    this.cacheExpiry = null;
    console.log('[FEATHERLESS] Cache cleared');
  }
}

// Create singleton instance
const featherlessService = new FeatherlessService();

module.exports = featherlessService;