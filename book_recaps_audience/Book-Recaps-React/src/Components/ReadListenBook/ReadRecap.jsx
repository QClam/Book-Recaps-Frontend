import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReadRecap.scss';

const ReadRecap = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false); // state to toggle "see more"
  const navigate = useNavigate();

  // Get accessToken and refreshToken from localStorage
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('https://bookrecaps.cloud/api/book/getallbooks', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        const data = response.data;
        if (data && data.succeeded && Array.isArray(data.data.$values)) {
          setBooks(data.data.$values);
        } else {
          console.error('Data is not an array:', data);
          setBooks([]);
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchBooks();
        } else {
          setError(error.message);
          console.error('Error fetching books:', error);
        }
      }
    };

    fetchBooks();
  }, [accessToken, refreshToken]);

  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://bookrecaps.cloud/api/tokens/refresh", {
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

  const handleBookClick = (bookId) => {
    navigate(`/recap/${bookId}`);
  };

  const handleSeeMore = () => {
    navigate('/all-books-recap'); // Chuyển hướng đến trang hiển thị tất cả sách
  };

  const displayedBooks = showAll ? books : books.slice(0, 8); // Hiển thị 8 quyển đầu tiên

  return (
    <div className="read-recap-container">
      <h2>Popular books</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="book-list">
        {Array.isArray(displayedBooks) && displayedBooks.length > 0 ? (
          displayedBooks.map((book) => (
            <div key={book.$id} className="book-item" onClick={() => handleBookClick(book.$id)}>
              <img src={book.coverImage} alt={book.title} className="book-cover" />
              <h2>{book.title}</h2>
              <h3>{book.originalTitle}</h3>
              <p><strong>Publication Year:</strong> {book.publicationYear}</p>
              {book.authors && book.authors.$values.length > 0 && (
                <p><strong>{book.authors.$values[0].name}</strong></p>
                
              )}
               
            </div>
          ))
        ) : (
          <p>No books available</p>
        )}
      </div>
      {books.length > 8 && !showAll && (
        <button className="see-more-button" onClick={handleSeeMore}>
          See more
        </button>
      )}
    </div>
  );
};

export default ReadRecap;
