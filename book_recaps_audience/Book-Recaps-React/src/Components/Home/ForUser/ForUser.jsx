import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ForUser.scss'; // Make sure to create this file for styling
import { useNavigate } from 'react-router-dom'; 
const ForUser = () => {
  // State variables
  const [userId, setUserId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Retrieve the access token from local storage
  const accessToken = localStorage.getItem('authToken');

  // Fetch user data to get the user ID
  const fetchUserId = async () => {
    try {
      const response = await axios.get('https://bookrecaps.cloud/api/personal/profile', {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const userId = response.data.id; // Get the user ID
      setUserId(userId); // Store the user ID in state
      return userId;
    } catch (err) {
      console.error('Error fetching user ID:', err);
      setError('Failed to fetch user ID');
      setLoading(false);
    }
  };

  // Fetch recommendations using the user ID
  const fetchRecommendations = async (id) => {
    try {
      const response = await axios.get(`https://ai.hieuvo.dev/ml/recommendations/for-you?user=${id}`);
      setRecommendations(response.data); // Store recommendations data
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to fetch recommendations');
      setLoading(false);
    }
  };

  // Fetch user ID and recommendations on component mount
  useEffect(() => {
    const getUserData = async () => {
      const id = await fetchUserId();
      if (id) {
        await fetchRecommendations(id);
      }
    };
    getUserData();
  }, []);

  // Render loading or error state
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Render recommendations data
  return (
    <div className="for-user">
      <h1>For You</h1>
      <div className="recommendations">
        {recommendations.map((item, index) => (
           <div 
            key={index} 
            className="recommendation-item"
            onClick={() => navigate(`/user-recap-detail-item/${item.book.id}`)} // Điều hướng khi click
          >
            <img src={item.book.coverImage} alt={item.book.title} className="book-cover" />
            <div className="book-details">
              <h2 className="book-title">{item.book.title}</h2>
              <p className="book-year"><strong>Publication Year:</strong> {item.book.publicationYear}</p>
              <p className="book-name"><strong>Name:</strong> {item.name}</p>
              {/* <p className="book-date"><strong>Created At:</strong> {new Date(item.createdAt).toLocaleString()}</p>
              <p className="book-premium"><strong>Premium:</strong> {item.isPremium ? 'Yes' : 'No'}</p> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForUser;
