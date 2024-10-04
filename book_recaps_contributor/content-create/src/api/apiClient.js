import axios from 'axios';
import { refreshToken } from './refreshToken';

const apiClient = axios.create({
  baseURL: 'https://160.25.80.100:7124/api', // Your API base URL
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('jwtToken');
    const expirationTime = localStorage.getItem('tokenExpiration');

    if (token && expirationTime) {
      const isTokenExpired = new Date().getTime() > expirationTime;

      // If the token is expired, try to refresh it
      if (isTokenExpired) {
        try {
          await refreshToken(); // Attempt to refresh the token
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Optionally redirect to login or handle the error
        }
      }
    }

    // Re-set the token after potential refresh
    const newToken = localStorage.getItem('jwtToken');
    if (newToken) {
      config.headers['Authorization'] = `Bearer ${newToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
