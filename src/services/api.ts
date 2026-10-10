/**
 * Axios instance terpusat untuk semua komunikasi ke backend.
 * - Base URL dari utils/constants
 * - Request interceptor: otomatis sisipkan header Authorization Bearer JWT
 * - Response interceptor: auto-logout saat 401 (token invalid/kedaluwarsa)
 *
 * @format
 */

import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../utils/constants';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Sisipkan JWT dari store ke setiap request.
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 401 -> sesi tidak valid, paksa logout agar RootNavigator kembali ke Auth stack.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export default api;
