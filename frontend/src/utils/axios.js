import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5002/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
    return Promise.reject(error);
  }
);

export default instance; 