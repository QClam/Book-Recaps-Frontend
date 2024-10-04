import apiClient from './apiClient';

export const getProtectedData = async () => {
  try {
    const response = await apiClient.get('/protected-endpoint'); // Replace with your endpoint
    return response.data;
  } catch (error) {
    console.error('Error fetching protected data:', error);
    throw error;
  }
};
