import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',  // Use relative path since we're proxying through Nginx
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now()
    };
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the complete error details
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: error.config
    });

    // Network errors
    if (!error.response) {
      console.error('Network Error - Please check your connection or try again later');
    }

    if (error.response?.status === 401) {
      // Only redirect to login if not already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance; 