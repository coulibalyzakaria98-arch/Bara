import axios from 'axios';

// Appel direct au backend pour debug (contourne le proxy Vite)
const API_BASE_URL = 'http://localhost:5000/api';

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
