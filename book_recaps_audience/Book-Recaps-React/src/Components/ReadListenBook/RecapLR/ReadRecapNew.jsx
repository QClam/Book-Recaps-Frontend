import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReadRecapNew.scss';

const ReadRecapNew = () => {
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
        const response = await axios.get('https://160.25.80.100:7124/api/book/getallbooks', {
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

  // const handleBookClick = (id) => {
  //   navigate(`/bookdetailbook/${id}`); // Use the book's id for navigation
  // };
  const handleBookClick = (id) => {
    navigate(`/user-recap-detail/${id}`); // Navigate to UserRecapDetail with the book ID
  };
  //chay qua class BookDetailBook
  const handleSeeMore = () => {
    navigate('/all-books-recap'); // Navigate to a page displaying all books
  };

  const displayedBooks = showAll ? books : books.slice(20, 32); // Display the last 8 books

  return (
    <div className="book-display-container">
  <h1 className="bookh1">Trending</h1>
  {error && <p className="error-message">{error}</p>}
  <div className="book-list-book">
    {Array.isArray(displayedBooks) && displayedBooks.length > 0 ? (
      displayedBooks.map((book) => (
        <div key={book.id} className="book-item-book" onClick={() => handleBookClick(book.id)}>
          <img src={book.coverImage} alt={book.title} className="book-cover-book" />
          <h2>{book.title}</h2>
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

export default ReadRecapNew;
