import React, { useEffect, useState } from 'react';
import './BookApiDetail.scss';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookApiDetail = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get accessToken and refreshToken from localStorage
  const accessToken = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');

  const fetchBooks = async () => {
    try {
      const response = await axios.get('https://160.25.80.100:7124/api/book/getallbooks', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      if (data && data.data && Array.isArray(data.data.$values)) {
        setBooks(data.data.$values);
      } else {
        setBooks([]);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await handleTokenRefresh();
        fetchBooks(); // Retry fetching books after refreshing the token
      } else {
        setError(error.message);
        console.error('Error fetching data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post('https://160.25.80.100:7124/api/tokens/refresh', {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      // Update localStorage with new tokens
      localStorage.setItem('authToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing token:', error);
      setError('Session expired. Please log in again.');
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [accessToken]);

  const handleBookClick = (id) => {
    navigate(`/bookdetailbook/${id}`); // Navigate to the book detail page with the book ID
  };

  return (
    <div className="book-api-detail">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul className="book-detail-list">
        {books.map(book => (
          <li
            key={book.id}
            className="book-detail-item"
            onClick={() => handleBookClick(book.id)}
            style={{ cursor: 'pointer' }}
          >
            <h2>{book.title}</h2>
            <h3>{book.originalTitle}</h3>
            <p>{book.description}</p>
            <p><strong>Publication Year:</strong> {book.publicationYear}</p>
            {book.coverImage && <img src={book.coverImage} alt={book.title} className="book-detail-cover" />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookApiDetail;
