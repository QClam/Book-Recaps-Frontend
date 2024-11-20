import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../UserRecap/UserRecap.scss";  // Đổi tên SCSS file

const UserRecap = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('https://160.25.80.100:7124/api/book/getallbooks', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
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

  const handleBookClick = (book) => {
    navigate(`/user-recap-detail/${book.id}`); // Navigate to UserRecapDetail with the book ID
  };


  
  const displayedBooks = showAll ? books : books.slice(0, 12); // Show first 8 books by default

  const truncateTitle = (title) => {
    return title.length > 25 ? `${title.substring(0, 30)}...` : title;
  };
  return (
    <div className="recap-wrapper">
      <h2>Popular </h2>
      {error && <p className="recap-error">{error}</p>}
      <div className="recap-book-grid">
        {Array.isArray(displayedBooks) && displayedBooks.length > 0 ? (
          displayedBooks.map((book) => (
            <div key={book.id} className="recap-book-card" onClick={() => handleBookClick(book)}>
              <img src={book.coverImage} alt={book.title} className="recap-book-cover" />
              <h2>{book.title.length > 26 ? `${book.title.slice(0, 26)}\n${book.title.slice(26)}` : book.title}</h2>
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
        <button className="recap-see-more" onClick={() => setShowAll(true)}>
          See more
        </button>
      )}
    </div>
  );
};

export default UserRecap;