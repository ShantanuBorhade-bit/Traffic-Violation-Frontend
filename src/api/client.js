import axios from 'axios';

// Development keeps the relative path so the Vite proxy forwards to localhost:5000.
// A deployed build sets VITE_API_URL to the API origin, e.g.
// https://traffic-mama-backend.onrender.com — the /api/v1 prefix is added when absent.
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = /\/api\/v1$/.test(API_ORIGIN) ? API_ORIGIN : `${API_ORIGIN}/api/v1`;

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
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Challans (Citizen) ──
export const citizenChallanAPI = {
  getMyChallans: () => api.get('/challans/my'),
  getById: (id) => api.get(`/challans/${id}`),
};

// ── Payments (Citizen) — demo checkout, no real money moves ──
export const paymentAPI = {
  // `idempotencyKey` travels in the body (the API validates it there, not as a header).
  create: (data) => api.post('/payments', data),
  simulate: (id, outcome) => api.post(`/payments/${id}/simulate`, { outcome }),
  getById: (id) => api.get(`/payments/${id}`),
  getByReference: (reference) => api.get(`/payments/reference/${reference}`),
  getMyPayments: (params) => api.get('/payments/my', { params }),
  getReceipt: (id) => api.get(`/payments/${id}/receipt`),
  // Admin/operator listing across all citizens.
  listAll: (params) => api.get('/admin/payments', { params }),
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
  detectPlate: (formData) =>
    api.post('/officer/detect-plate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  upload: (formData) =>
    api.post('/officer/manual-violations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: () => api.get('/officer/manual-violations'),
};

export default api;
