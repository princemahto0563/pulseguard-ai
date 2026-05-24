import axios from 'axios';

let API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pulseguard-ai-1.onrender.com/api';

// Defensive Programming: Automatically append '/api' if not present in the URL
if (API_URL && !API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
  const cleanUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  API_URL = `${cleanUrl}/api`;
}

// Extreme SRE Defense: If running in production (vercel domain) but API_URL contains localhost,
// automatically override it to point to the production Render backend to guarantee zero-friction access!
if (typeof window !== 'undefined') {
  const currentHost = window.location.hostname;
  const isLocalClient = currentHost === 'localhost' || currentHost === '127.0.0.1';
  const isLocalApi = API_URL.includes('localhost') || API_URL.includes('127.0.0.1') || API_URL.includes(':5001') || API_URL.includes(':5000');
  
  if (!isLocalClient && isLocalApi) {
    console.warn('⚠️  SRE Alert: Localhost API target detected on production host. Automatically overriding base URL to secure Render cloud node.');
    API_URL = 'https://pulseguard-ai-1.onrender.com/api';
  }
}

console.log('📡 PulseGuard API Client initialized with Base URL:', API_URL);

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header dynamically from localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pg_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized errors and retry logic for Render cold starts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if it's a timeout or network error (Render cold start)
    // Retry up to 3 times on timeout or network error
    if (
      (error.code === 'ECONNABORTED' || !error.response) && 
      (!originalRequest._retryCount || originalRequest._retryCount < 3)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      const backoffDelay = originalRequest._retryCount * 2000; // 2s, 4s, 6s backoff
      console.warn(`⏳ Network error or timeout. Retrying request in ${backoffDelay}ms... (Attempt ${originalRequest._retryCount}/3)`);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return apiClient(originalRequest);
    }

    // Auto-logout if unauthorized (401)
    if (error.response?.status === 401 && !originalRequest._isRetryAuth) {
      originalRequest._isRetryAuth = true;
      console.warn('🚨 Unauthorized (401) response. Clearing session and logging out.');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pg_token');
        localStorage.removeItem('pg_user');
        // Dispatch a custom event so store can catch it and clear internal state
        window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
