// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Helper function for API calls with caching
async function fetchWithCache(url, options = {}, useCache = true) {
  const cacheKey = `${url}${JSON.stringify(options)}`;
  
  if (useCache && cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
    cache.delete(cacheKey);
  }
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (useCache) {
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }
  
  return data;
}

// API Functions
export const api = {
  // Health check
  healthCheck: () => fetchWithCache(`${API_BASE_URL}/health`, {}, false),
  
  // Get companies with filters and pagination
  getCompanies: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    return fetchWithCache(`${API_BASE_URL}/companies?${queryParams}`);
  },
  
  // Search companies
  searchCompanies: (query, limit = 20) => 
    fetchWithCache(`${API_BASE_URL}/companies/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  
  // Get autocomplete suggestions
  getSuggestions: (query, limit = 10) =>
    fetchWithCache(`${API_BASE_URL}/companies/suggest?q=${encodeURIComponent(query)}&limit=${limit}`),
  
  // Get nearby companies
  getNearbyCompanies: (lat, lng, radius = 50, limit = 20) =>
    fetchWithCache(`${API_BASE_URL}/companies/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`),
  
  // Get single company
  getCompany: (id) => fetchWithCache(`${API_BASE_URL}/companies/${id}`),
  
  // Get filter values
  getFilters: () => fetchWithCache(`${API_BASE_URL}/filters`),
};

// Clear cache
export const clearCache = () => cache.clear();

// Export base URL for direct use
export { API_BASE_URL };
