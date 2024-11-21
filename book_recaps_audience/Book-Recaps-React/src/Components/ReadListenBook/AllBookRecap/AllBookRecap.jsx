import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AllBookRecap.scss';

const AllBookRecap = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("authToken");

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
        setError(error.message);
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [accessToken]);

  // const handleBookClick = (bookId) => {
  //   navigate(`/recap/${bookId}`);
  // };
  const handleBookClick = (bookId) => {
    navigate(`/user-recap-detail/${bookId}`); // Navigate to UserRecapDetail with the book ID
  };

  return (
    <div className="all-books-container">
      {/* <h1>All Books</h1> */}
      {error && <p className="error-message">{error}</p>}
      <div className="book-list">
        {Array.isArray(books) && books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="book-item" onClick={() => handleBookClick(book.id)}>
              <img src={book.coverImage} alt={book.title} className="book-cover" />
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
    </div>
  );
};

export default AllBookRecap;
