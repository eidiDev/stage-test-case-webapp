import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 &&
      window.location.pathname !== '/login') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth', { email, password }),
};

export const areasApi = {
  getAll: () => api.get('/areas'),
  getOne: (id: string) => api.get(`/areas/${id}`),
  create: (data: any) => api.post('/areas', data),
  update: (id: string, data: any) => api.patch(`/areas/${id}`, data),
  delete: (id: string) => api.delete(`/areas/${id}`),
};

export const toolsApi = {
  getAll: () => api.get('/tools'),
  getAllFilter: (param: any) =>
    api.get("/tools", { params: param?.filter ? { filter: param.filter } : {} }),
  getOne: (id: string) => api.get(`/tools/${id}`),
  create: (data: any) => api.post('/tools', data),
  update: (id: string, data: any) => api.patch(`/tools/${id}`, data),
  delete: (id: string) => api.delete(`/tools/${id}`),
};

export const peopleApi = {
  getAll: () => api.get('/people'),
  getAllFilter: (param: any) =>
    api.get("/people", { params: param?.filter ? { filter: param.filter } : {} }),
  getOne: (id: string) => api.get(`/people/${id}`),
  create: (data: any) => api.post('/people', data),
  update: (id: string, data: any) => api.patch(`/people/${id}`, data),
  delete: (id: string) => api.delete(`/people/${id}`),
};

export const documentsApi = {
  getAll: () => api.get('/documents'),
  getAllFilter: (param: any) =>
    api.get("/documents", { params: param?.filter ? { filter: param.filter } : {} }),
  getOne: (id: string) => api.get(`/documents/${id}`),
  create: (data: any) => api.post('/documents', data),
  update: (id: string, data: any) => api.patch(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const processApi = {
  getAll: () => api.get('/process'),
  getTree: (id: string) => api.get(`/process/${id}/tree`),
  getOne: (id: string) => api.get(`/process/${id}`),
  create: (data: any) => api.post('/process', data),
  update: (id: string, data: any) => api.patch(`/process/${id}`, data),
  delete: (id: string) => api.delete(`/process/${id}`),
};
