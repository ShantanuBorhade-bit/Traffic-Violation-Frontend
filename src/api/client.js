import axios from 'axios';

const API_BASE = '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// ── Challans (Citizen) ──
export const citizenChallanAPI = {
  getMyChallans: () => api.get('/challans/my'),
  getById: (id) => api.get(`/challans/${id}`),
};

// ── Grievances (Citizen) ──
export const grievanceAPI = {
  create: (formData) =>
    api.post('/grievances', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyGrievances: () => api.get('/grievances/my'),
  getGrievanceById: (id) => api.get(`/grievances/${id}`),
};

// ── Grievances (Officer) ──
export const officerGrievanceAPI = {
  list: () => api.get('/officer/grievances'),
  getById: (id) => api.get(`/officer/grievances/${id}`),
  startReview: (id) => api.patch(`/officer/grievances/${id}/review`),
  approve: (id, officerNote) =>
    api.patch(`/officer/grievances/${id}/approve`, { officerNote }),
  reject: (id, officerNote) =>
    api.patch(`/officer/grievances/${id}/reject`, { officerNote }),
};

// ── Violations (Admin) ──
export const violationAPI = {
  list: (params) => api.get('/violations', { params }),
  getById: (id) => api.get(`/violations/${id}`),
};

// ── Challans (Admin) ──
export const challanAPI = {
  list: (params) => api.get('/challans', { params }),
  getById: (id) => api.get(`/challans/${id}`),
};

// ── Users (Admin) ──
export const adminUserAPI = {
  list: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  create: (data) => api.post('/admin/users', data),
};

// ── Manual Violations (Traffic Officer) ──
export const manualViolationAPI = {
  upload: (formData) =>
    api.post('/officer/manual-violations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: () => api.get('/officer/manual-violations'),
};

export default api;
