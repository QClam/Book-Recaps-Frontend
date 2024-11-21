import React, { useState, useEffect } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookByList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookData } = location.state || {}; // Access book data from navigation state
  const [recapDetails, setRecapDetails] = useState(null); // State to store detailed recap data
  const [error, setError] = useState(null);

  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!bookData) {
    return <p>No book data available.</p>;
  }

  // Function to handle clicking on a recap
  const handleRecapClick = async (recap) => {
    console.log("Recap ID:", recap.id); // Log recap ID

    try {
      const response = await axios.get(`https://160.25.80.100:7124/getrecapbyId/${recap.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      if (data.succeeded && data.data) {
        const recapVersion = data.data.recapVersions?.$values[0];

        console.log("Recap Version ID:", recapVersion?.id); // Log recap version ID

        const audioUrl = recapVersion?.audioURL;
        const transcriptUrl = recapVersion?.transcriptUrl;

        setRecapDetails(data.data);
        
        // Navigate to the detailed page with recapId, bookId, audioUrl, and transcriptUrl
        navigate('/user-recap-new-detail', { 
          state: { 
            recapId: recap.id, 
            bookId: bookData.id, // Pass the bookId here
            audioUrl,   // Pass Audio URL
            transcriptUrl, // Pass Transcript URL
          }
        });
      } else {
        console.error('Failed to fetch recap details');
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await handleTokenRefresh();
        handleRecapClick(recap); // Retry after refreshing the token
      } else {
        console.error('Error fetching recap details:', error);
        setError('Unable to fetch recap details.');
      }
    }
  };

  // Handle token refresh
  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Session expired. Please log in again.");
    }
  };

  return (
    <div>
      <h1>{bookData.title}</h1>
      <img src={bookData.coverImage} alt={bookData.title} />
      <p><strong>Author:</strong> {bookData.authors && bookData.authors.$values[0]?.name}</p>
      <p><strong>Description:</strong> {bookData.description}</p>

      <h2>Recaps</h2>
      {bookData.recaps && bookData.recaps.$values.length > 0 ? (
        bookData.recaps.$values.map((recap) => (
          <div 
            key={recap.id} 
            style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem', cursor: 'pointer' }} 
            onClick={() => handleRecapClick(recap)} // Handle recap click
          >
            <p><strong>Name:</strong> {recap.name}</p>
            <p><strong>Published:</strong> {recap.isPublished ? 'Yes' : 'No'}</p>
            <p><strong>Premium:</strong> {recap.isPremium ? 'Yes' : 'No'}</p>
          </div>
        ))
      ) : (
        <p>No recaps available.</p>
      )}

      {/* Render detailed recap data if available */}
      {recapDetails && (
        <div>
          <h3>Recap Details</h3>
          <p><strong>Name:</strong> {recapDetails.name}</p>
          <p><strong>Published:</strong> {recapDetails.isPublished ? 'Yes' : 'No'}</p>
          <p><strong>Premium:</strong> {recapDetails.isPremium ? 'Yes' : 'No'}</p>
          <p><strong>Likes Count:</strong> {recapDetails.likesCount}</p>
          <p><strong>Views Count:</strong> {recapDetails.viewsCount}</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default BookByList;
