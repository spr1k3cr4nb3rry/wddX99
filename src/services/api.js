// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken()
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      let errorMessage = 'Something went wrong'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    // Re-throw with more context if it's not already an Error object
    if (error instanceof Error) {
      throw error
    }
    throw new Error(error.message || 'Network error occurred')
  }
}

// Auth API
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (name, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  },
}

// Topics API
export const topicsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    
    const queryString = params.toString()
    return apiRequest(`/topics${queryString ? `?${queryString}` : ''}`)
  },

  getById: async (id) => {
    return apiRequest(`/topics/${id}`)
  },

  create: async (topicData) => {
    return apiRequest('/topics', {
      method: 'POST',
      body: JSON.stringify(topicData),
    })
  },

  update: async (id, topicData) => {
    return apiRequest(`/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(topicData),
    })
  },

  vote: async (id) => {
    return apiRequest(`/topics/${id}/vote`, {
      method: 'POST',
    })
  },

  approve: async (id) => {
    return apiRequest(`/topics/${id}/approve`, {
      method: 'POST',
    })
  },

  reject: async (id) => {
    return apiRequest(`/topics/${id}/reject`, {
      method: 'POST',
    })
  },

  delete: async (id) => {
    return apiRequest(`/topics/${id}`, {
      method: 'DELETE',
    })
  },
}

// Users API
export const usersAPI = {
  getById: async (id) => {
    return apiRequest(`/users/${id}`)
  },

  getTopics: async (id) => {
    return apiRequest(`/users/${id}/topics`)
  },

  update: async (id, profileData) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  getDashboard: async () => {
    return apiRequest('/users/me/dashboard')
  },
}

// Upload API
export const uploadAPI = {
  uploadImage: async (file) => {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image')
    }

    return data
  },

  deleteImage: async (filename) => {
    return apiRequest(`/upload/image/${filename}`, {
      method: 'DELETE',
    })
  },
}

// Comments API
export const commentsAPI = {
  getByTopic: async (topicId) => {
    return apiRequest(`/comments/topic/${topicId}`)
  },

  create: async (topicId, content, parentId = null) => {
    return apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({ topicId, content, parentId }),
    })
  },

  update: async (id, content) => {
    return apiRequest(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  },

  delete: async (id) => {
    return apiRequest(`/comments/${id}`, {
      method: 'DELETE',
    })
  },
}

// Search API
export const searchAPI = {
  getSuggestions: async (query) => {
    const params = new URLSearchParams({ q: query })
    return apiRequest(`/search/suggestions?${params.toString()}`)
  },

  getPopular: async () => {
    return apiRequest('/search/popular')
  },
}

// Notifications API
export const notificationsAPI = {
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams()
    if (params.unread_only) queryParams.append('unread_only', params.unread_only)
    if (params.limit) queryParams.append('limit', params.limit)
    if (params.offset) queryParams.append('offset', params.offset)
    const query = queryParams.toString()
    return apiRequest(`/notifications${query ? `?${query}` : ''}`)
  },

  getUnreadCount: async () => {
    return apiRequest('/notifications/unread-count')
  },

  markAsRead: async (id) => {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    })
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PUT',
    })
  },

  delete: async (id) => {
    return apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    })
  },

  deleteAllRead: async () => {
    return apiRequest('/notifications/read/all', {
      method: 'DELETE',
    })
  },
}

// Analytics API
export const analyticsAPI = {
  getPlatform: async (period = '30d') => {
    return apiRequest(`/analytics/platform?period=${period}`)
  },

  getUser: async (userId, period = '30d') => {
    return apiRequest(`/analytics/user/${userId}?period=${period}`)
  },

  getTopic: async (topicId, period = '30d') => {
    return apiRequest(`/analytics/topic/${topicId}?period=${period}`)
  },
}

// Bookmarks API
export const bookmarksAPI = {
  getAll: async () => {
    return apiRequest('/bookmarks')
  },

  add: async (topicId) => {
    return apiRequest(`/bookmarks/${topicId}`, {
      method: 'POST',
    })
  },

  remove: async (topicId) => {
    return apiRequest(`/bookmarks/${topicId}`, {
      method: 'DELETE',
    })
  },

  check: async (topicId) => {
    return apiRequest(`/bookmarks/check/${topicId}`)
  },

  getCount: async (topicId) => {
    return apiRequest(`/bookmarks/count/${topicId}`)
  },
}

// Voting API
export const votingAPI = {
  voteOnProposition: async (propositionId, voteValue, propositionType = 'topic') => {
    return apiRequest(`/voting/proposition/${propositionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteValue, propositionType }),
    })
  },

  getStatistics: async (propositionId, propositionType = 'topic') => {
    return apiRequest(`/voting/proposition/${propositionId}/statistics?propositionType=${propositionType}`)
  },

  getFiltered: async (filter = 'all', propositionType = 'topic', minVotes = 0) => {
    const params = new URLSearchParams({
      filter,
      propositionType,
      minVotes: minVotes.toString(),
    })
    return apiRequest(`/voting/filtered?${params.toString()}`)
  },
}

// Surveys API
export const surveysAPI = {
  getAll: async (isActive = null) => {
    const params = new URLSearchParams()
    if (isActive !== null) params.append('isActive', isActive.toString())
    const query = params.toString()
    return apiRequest(`/surveys${query ? `?${query}` : ''}`)
  },

  getById: async (id) => {
    return apiRequest(`/surveys/${id}`)
  },

  create: async (surveyData) => {
    return apiRequest('/surveys', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    })
  },

  update: async (id, surveyData) => {
    return apiRequest(`/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surveyData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/surveys/${id}`, {
      method: 'DELETE',
    })
  },
}

// Research Proposals API
export const researchProposalsAPI = {
  getAll: async (isActive = null) => {
    const params = new URLSearchParams()
    if (isActive !== null) params.append('isActive', isActive.toString())
    const query = params.toString()
    return apiRequest(`/research-proposals${query ? `?${query}` : ''}`)
  },

  getById: async (id) => {
    return apiRequest(`/research-proposals/${id}`)
  },

  create: async (proposalData) => {
    return apiRequest('/research-proposals', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    })
  },

  vote: async (id) => {
    return apiRequest(`/research-proposals/${id}/vote`, {
      method: 'POST',
    })
  },
}

// Whitepapers API
export const whitepapersAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.category) params.append('category', filters.category)
    if (filters.tags) params.append('tags', Array.isArray(filters.tags) ? filters.tags.join(',') : filters.tags)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    const query = params.toString()
    return apiRequest(`/whitepapers${query ? `?${query}` : ''}`)
  },

  getById: async (id) => {
    return apiRequest(`/whitepapers/${id}`)
  },

  create: async (whitepaperData) => {
    return apiRequest('/whitepapers', {
      method: 'POST',
      body: JSON.stringify(whitepaperData),
    })
  },

  update: async (id, whitepaperData) => {
    return apiRequest(`/whitepapers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(whitepaperData),
    })
  },

  delete: async (id) => {
    return apiRequest(`/whitepapers/${id}`, {
      method: 'DELETE',
    })
  },
}

// Health check
export const healthCheck = async () => {
  return apiRequest('/health')
}

