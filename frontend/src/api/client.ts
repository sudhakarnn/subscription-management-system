import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('brightloop_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle common error codes
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token on authentication failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('brightloop_token');
    }
    return Promise.reject(error);
  }
);

export async function checkBackendHealth() {
  try {
    // Health endpoint is mounted at /api/health
    const backendRoot = API_BASE_URL.replace(/\/v1$/, '');
    const res = await axios.get(`${backendRoot}/health`, { timeout: 3000 });
    return res.data;
  } catch (err) {
    return {
      success: false,
      error: 'Backend is offline or unreachable',
    };
  }
}
