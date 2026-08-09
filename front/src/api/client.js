import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/capp',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config.url);
    }
    if (error.response?.status === 500) {
      console.error('Server error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
