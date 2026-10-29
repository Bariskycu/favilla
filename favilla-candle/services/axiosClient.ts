// favilla-candle/services/axiosClient.ts
import axios from 'axios';

// Development'ta Vite proxy kullanıyoruz, production'da VITE_API_URL kullanılacak
// Backend route'ları zaten /api/v1 içeriyor, bu yüzden baseURL /api/v1 olmalı
// Endpoint'ler /v1/ olmadan yazılmalı (örn: /auth/login)
// Backend route'ları zaten /api/v1 içeriyor, bu yüzden baseURL /api/v1 olmalı
// Endpoint'ler /v1/ olmadan yazılmalı (örn: /auth/login)
const getBaseUrl = () => {
  if (!import.meta.env.PROD) return '/api/v1'; // Development: Vite Proxy via /api

  // Production:
  // Fallback production URL should be relative path '/api/v1' to avoid security risks
  // The backend should serve the frontend, or use VITE_API_URL for specific external backend.
  let url = import.meta.env.VITE_API_URL;

  if (!url) {
    // If no ENV is provided, assume relative path on the same domain
    return '/api/v1';
  }

  // Trailing slash clean up
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  // Ensure the suffix /api/v1 is present if not already (assuming standard backend structure)
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }
  return url;
};

const baseURL = getBaseUrl();

const axiosClient = axios.create({
  baseURL,
  withCredentials: true, // Cookies automatic transmission
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // Debug: Log actual URL
    const fullURL = config.baseURL + config.url;
    // Optional: Log API calls for debugging
    // console.log('API Request:', {
    //   method: config.method?.toUpperCase(),
    //   url: fullURL
    // });
    return config;
  },
  (error) => Promise.reject(error)
);

// Token Refresh Logic Variables
let isRefreshing = false;
let failedQueue: Array<{ resolve: () => void; reject: (error: any) => void }> = [];

// Store Injection to avoid circular dependency
let appStore: any = null;
export const injectStore = (store: any) => {
  appStore = store;
};

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response Interceptor: Error handling and data unwrapping
axiosClient.interceptors.response.use(
  (response) => {
    // If pagination, return full object
    if (response.data && response.data.pagination) {
      return response.data;
    }
    // Unwrap data wrapper
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 error and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If refresh endpoint failed, logout
      if (originalRequest.url.includes('/auth/refresh')) {
        if (appStore) {
          appStore.getState().logout();
        } else {
          localStorage.removeItem('favilla-storage');
        }
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt refresh via cookie
        // Use raw axios to bypass interceptors, but ensure withCredentials is true
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

        // Process queue (success)
        processQueue(null);

        // Retry original request (browser attaches new cookies)
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Logout on fail
        if (appStore) {
          appStore.getState().logout();
        }
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Log detailed error
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    const message = error.response?.data?.message || error.message || 'Bir hata oluştu';

    // Global Error Toast (exclude 401 as it is handled by auth logic)
    if (error.response?.status !== 401 && appStore) {
      // Optional: don't toast for every error if desired
      appStore.getState().addToast(message, 'error');
    }

    return Promise.reject(new Error(message));
  }
);
export default axiosClient;
