import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if:
    // 1. It's a 401 error
    // 2. We're not already on login/register pages
    // 3. It's not a login/register request itself
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthPage && !isAuthRequest) {
      // Don't clear storage or redirect for profile verification failures
      // Let the AuthContext handle those gracefully
      const isProfileCheck = error.config?.url?.includes('/auth/profile');
      if (!isProfileCheck) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Campaigns API
export const campaignsAPI = {
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  send: (id) => api.post(`/campaigns/${id}/send`),
  schedule: (id, scheduledAt) => api.post(`/campaigns/${id}/schedule`, { scheduled_at: scheduledAt }),
  cancel: (id) => api.post(`/campaigns/${id}/cancel`),
  duplicate: (id) => api.post(`/campaigns/${id}/duplicate`),
  addContacts: (id, contactIds) => api.post(`/campaigns/${id}/contacts`, { contact_ids: contactIds }),
  removeContacts: (id, contactIds) => api.delete(`/campaigns/${id}/contacts`, { data: { contact_ids: contactIds } }),
  getStats: (id) => api.get(`/campaigns/${id}/stats`),
};

// Contacts API
export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  bulkCreate: (contacts) => api.post('/contacts/bulk', { contacts }),
  bulkDelete: (ids) => api.delete('/contacts/bulk', { data: { ids } }),
  getActive: () => api.get('/contacts/active'),
};

// Groups API
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  delete: (id) => api.delete(`/groups/${id}`),
  addContacts: (id, contactIds) => api.post(`/groups/${id}/contacts`, { contact_ids: contactIds }),
  removeContacts: (id, contactIds) => api.delete(`/groups/${id}/contacts`, { data: { contact_ids: contactIds } }),
};

// Messages API
export const messagesAPI = {
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getConversation: (contactId, params) => api.get(`/messages/conversations/${contactId}`, { params }),
  send: (data) => api.post('/messages/send', data),
  getRecent: (limit) => api.get('/messages/recent', { params: { limit } }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCampaignStats: (params) => api.get('/analytics/campaigns', { params }),
  getMessageStats: (params) => api.get('/analytics/messages', { params }),
  getDaily: (params) => api.get('/analytics/daily', { params }),
};

// Settings API
export const settingsAPI = {
  getTwilio: () => api.get('/settings/twilio'),
  updateTwilio: (data) => api.put('/settings/twilio', data),
  testTwilio: () => api.post('/settings/twilio/test'),
};

export default api;
