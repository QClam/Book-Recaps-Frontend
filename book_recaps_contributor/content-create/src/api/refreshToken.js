import apiClient from './apiClient';

export const refreshToken = async () => {
  try {
    const response = await apiClient.post('/refresh-token'); // Update with your refresh token endpoint
    const { token, expires_in } = response.data;

    // Store the new token and expiration time
    const expirationTime = new Date().getTime() + expires_in * 1000; // Convert to milliseconds
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('tokenExpiration', expirationTime);
    return token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};
