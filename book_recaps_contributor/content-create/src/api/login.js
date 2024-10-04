import axios from 'axios';

const API_URL = 'https://160.25.80.100:7124/api/tokens';

export const login = async (username, password) => {
  try {
    const response = await axios.post(API_URL, { username, password });
    const { token, expires_in } = response.data; // Assuming expires_in is in seconds

    // Store the token and expiration time
    const expirationTime = new Date().getTime() + expires_in * 1000; // Convert to milliseconds
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('tokenExpiration', expirationTime);
    return token;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};
