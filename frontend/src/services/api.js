import axios from 'axios';

// Use environment variable for API base URL (set in deployment platforms)
// Fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData, don't set Content-Type header - let browser handle multipart/form-data
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Remove Content-Type for FormData so browser sets it with boundary
      delete config.headers['Content-Type'];
    }
    
    console.log('🔑 API Request:', config.url, {
      hasToken: !!token,
      authHeader: config.headers.Authorization ? config.headers.Authorization.substring(0, 50) + '...' : 'AUCUN'
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only try refresh for 401 errors (not 403, 404, etc.)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`
            }
          });

          const { access_token } = response.data.data;
          localStorage.setItem('accessToken', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens but don't force redirect
        // Let the component handle the error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Return the original error so components can handle it
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};

// Candidate API
export const candidateAPI = {
  getProfile: async () => {
    const response = await api.get('/candidates/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/candidates/profile', data);
    return response.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadCV: async (file, autoAnalyze = true) => {
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('analyze', autoAnalyze.toString());

    // Don't set Content-Type - Axios will set it automatically with boundary
    const response = await api.post('/uploads/cv', formData);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/uploads/avatar', formData);
    return response.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await api.post('/uploads/logo', formData);
    return response.data;
  },
};

// Analysis API
export const analysisAPI = {
  getAnalysis: async (cvId) => {
    const response = await api.get(`/analysis/cv/${cvId}`);
    return response.data;
  },

  getRecommendations: async (cvId) => {
    const response = await api.get(`/analysis/cv/${cvId}/recommendations`);
    return response.data;
  },

  getExtractedData: async (cvId) => {
    const response = await api.get(`/analysis/cv/${cvId}/extracted-data`);
    return response.data;
  },

  applyToProfile: async (cvId) => {
    const response = await api.post(`/analysis/cv/${cvId}/apply-to-profile`);
    return response.data;
  },

  reanalyze: async () => {
    const response = await api.post('/analysis/cv/reanalyze');
    return response.data;
  },

  downloadPDF: async (analysisId = null) => {
    const url = analysisId
      ? `/uploads/cv/report/pdf?analysis_id=${analysisId}`
      : '/uploads/cv/report/pdf';

    const response = await api.get(url, {
      responseType: 'blob',
    });

    // Créer un lien de téléchargement
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `rapport_cv_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return { success: true };
  },
};

// Matching API
export const matchingAPI = {
  getMatchedJobs: async (limit = 20, minScore = 50) => {
    const response = await api.get('/matching/jobs', {
      params: { limit, min_score: minScore }
    });
    return response.data;
  },

  getMatchedCandidates: async (jobId = null, limit = 20, minScore = 50) => {
    const params = { limit, min_score: minScore };
    if (jobId) params.job_id = jobId;

    const response = await api.get('/matching/candidates', { params });
    return response.data;
  },

  calculateMatchScore: async (jobId) => {
    const response = await api.post('/matching/score', { job_id: jobId });
    return response.data;
  },
};

// Jobs API
export const jobsAPI = {
  list: async (filters = {}) => {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  },

  get: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  getCompanyJobs: async () => {
    const response = await api.get('/jobs/company');
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  toggleStatus: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/toggle-status`);
    return response.data;
  },

  // Legacy aliases
  create: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  update: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  delete: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (limit = 20, unreadOnly = false) => {
    const response = await api.get('/notifications', {
      params: { limit, unread_only: unreadOnly }
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/notifications/clear');
    return response.data;
  },
};

// Company API
export const companyAPI = {
  getProfile: async () => {
    const response = await api.get('/companies/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/companies/profile', data);
    return response.data;
  },
};

// Matches API
export const matchesAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/matches', { params: filters });
    return response.data;
  },

  getById: async (matchId) => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },

  setAction: async (matchId, action, notes = null) => {
    const response = await api.put(`/matches/${matchId}/action`, {
      action,
      notes
    });
    return response.data;
  },

  toggleFavorite: async (matchId, isFavorite = true) => {
    const response = await api.put(`/matches/${matchId}/favorite`, {
      is_favorite: isFavorite
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/matches/stats');
    return response.data;
  }
};

// Messages API
export const messagesAPI = {
  getMessages: async (matchId) => {
    const response = await api.get(`/messages/${matchId}`);
    return response.data;
  },

  sendMessage: async (matchId, content) => {
    const response = await api.post(`/messages/${matchId}`, { content });
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data;
  }
};

// Applications API
export const applicationsAPI = {
  getMyApplications: async (filters = {}) => {
    const response = await api.get('/applications/my-applications', { params: filters });
    return response.data;
  },

  getApplication: async (applicationId) => {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  applyToJob: async (jobId, coverLetter = null) => {
    const response = await api.post(`/jobs/${jobId}/apply`, {
      cover_letter: coverLetter
    });
    return response.data;
  },

  updateStatus: async (applicationId, status, notes = null) => {
    const response = await api.put(`/applications/${applicationId}/status`, {
      status,
      notes
    });
    return response.data;
  },

  withdraw: async (applicationId) => {
    const response = await api.delete(`/applications/${applicationId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/applications/stats');
    return response.data;
  }
};

// Posters API
export const postersAPI = {
  generate: async (posterData) => {
    const response = await api.post('/posters/generate', posterData);
    return response.data;
  },

  getAll: async (jobId = null) => {
    const params = {};
    if (jobId) params.job_id = jobId;

    const response = await api.get('/posters', { params });
    return response.data;
  },

  getById: async (posterId) => {
    const response = await api.get(`/posters/${posterId}`);
    return response.data;
  },

  delete: async (posterId) => {
    const response = await api.delete(`/posters/${posterId}`);
    return response.data;
  },

  publish: async (posterId, isPublished = true) => {
    const response = await api.put(`/posters/${posterId}/publish`, {
      is_published: isPublished
    });
    return response.data;
  },

  getDownloadUrl: (posterId) => {
    return `${API_BASE_URL}/posters/${posterId}/download`;
  },

  getViewUrl: (posterId) => {
    return `${API_BASE_URL}/posters/${posterId}/view`;
  }
};

// Analytics API
export const analyticsAPI = {
  getCandidateStats: async () => {
    const response = await api.get('/analytics/candidate/stats');
    return response.data;
  },

  getCompanyStats: async () => {
    const response = await api.get('/analytics/company/stats');
    return response.data;
  },

  getCandidateActivity: async () => {
    const response = await api.get('/analytics/candidate/activity');
    return response.data;
  },

  getCompanyActivity: async () => {
    const response = await api.get('/analytics/company/activity');
    return response.data;
  },

  exportPDF: async () => {
    const response = await api.get('/analytics/export/pdf', {
      responseType: 'blob'
    });
    return response;
  }
};

// Favorites API
export const favoritesAPI = {
  // Get all favorites
  getAll: async (type = null) => {
    const params = type ? { type } : {};
    const response = await api.get('/favorites', { params });
    return response.data;
  },

  // Add job to favorites (candidates)
  addJob: async (jobId, notes = null) => {
    const response = await api.post(`/favorites/job/${jobId}`, { notes });
    return response.data;
  },

  // Add candidate to favorites (companies)
  addCandidate: async (candidateId, notes = null) => {
    const response = await api.post(`/favorites/candidate/${candidateId}`, { notes });
    return response.data;
  },

  // Remove job from favorites
  removeJob: async (jobId) => {
    const response = await api.delete(`/favorites/job/${jobId}`);
    return response.data;
  },

  // Remove candidate from favorites
  removeCandidate: async (candidateId) => {
    const response = await api.delete(`/favorites/candidate/${candidateId}`);
    return response.data;
  },

  // Update favorite notes
  updateNotes: async (favoriteId, notes) => {
    const response = await api.put(`/favorites/${favoriteId}/notes`, { notes });
    return response.data;
  },

  // Check if job is favorited
  isJobFavorited: async (jobId) => {
    const response = await api.get(`/favorites/check/job/${jobId}`);
    return response.data;
  },

  // Check if candidate is favorited
  isCandidateFavorited: async (candidateId) => {
    const response = await api.get(`/favorites/check/candidate/${candidateId}`);
    return response.data;
  },

  // Get favorites stats
  getStats: async () => {
    const response = await api.get('/favorites/stats');
    return response.data;
  }
};

// Reviews API
export const reviewsAPI = {
  // Create a review
  create: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Update a review
  update: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  delete: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Get candidate reviews
  getCandidateReviews: async (candidateId, page = 1, perPage = 10) => {
    const response = await api.get(`/reviews/candidate/${candidateId}`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  // Get company reviews
  getCompanyReviews: async (companyId, page = 1, perPage = 10) => {
    const response = await api.get(`/reviews/company/${companyId}`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  // Get review stats
  getStats: async (entityType, entityId) => {
    const response = await api.get(`/reviews/stats/${entityType}/${entityId}`);
    return response.data;
  },

  // Mark review as helpful
  markHelpful: async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // Get my reviews (reviews I gave)
  getMyReviews: async () => {
    const response = await api.get('/reviews/my-reviews');
    return response.data;
  },

  // Get reviews about me
  getReviewsAboutMe: async () => {
    const response = await api.get('/reviews/about-me');
    return response.data;
  }
};

// Skill Tests API
export const skillTestsAPI = {
  // Get all tests
  getAll: async (params = {}) => {
    const response = await api.get('/skill-tests', { params });
    return response.data;
  },

  // Get test details
  getTest: async (testId) => {
    const response = await api.get(`/skill-tests/${testId}`);
    return response.data;
  },

  // Start a test
  startTest: async (testId) => {
    const response = await api.post(`/skill-tests/${testId}/start`);
    return response.data;
  },

  // Submit test answers
  submitTest: async (testId, answers, startedAt) => {
    const response = await api.post(`/skill-tests/${testId}/submit`, {
      answers,
      started_at: startedAt
    });
    return response.data;
  },

  // Get my results
  getMyResults: async () => {
    const response = await api.get('/skill-tests/results');
    return response.data;
  },

  // Get result details
  getResult: async (resultId) => {
    const response = await api.get(`/skill-tests/results/${resultId}`);
    return response.data;
  },

  // Get candidate results (for companies)
  getCandidateResults: async (candidateId) => {
    const response = await api.get(`/skill-tests/candidate/${candidateId}/results`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/skill-tests/categories');
    return response.data;
  },

  // Admin: Create test
  createTest: async (testData) => {
    const response = await api.post('/skill-tests/admin', testData);
    return response.data;
  },

  // Admin: Update test
  updateTest: async (testId, testData) => {
    const response = await api.put(`/skill-tests/admin/${testId}`, testData);
    return response.data;
  },

  // Admin: Delete test
  deleteTest: async (testId) => {
    const response = await api.delete(`/skill-tests/admin/${testId}`);
    return response.data;
  }
};

// Error handler helper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 'Une erreur est survenue';
    const errors = error.response.data?.errors || {};
    return { message, errors, status: error.response.status };
  } else if (error.request) {
    // No response received
    return {
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      errors: {},
      status: 0
    };
  } else {
    // Request setup error
    return {
      message: error.message || 'Une erreur est survenue',
      errors: {},
      status: 0
    };
  }
};

export default api;
