import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../TitleBook/Title.scss';

const Title = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://www.googleapis.com/books/v1/volumes?q=mom&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc')
      .then((response) => response.json())
      .then((data) => {
        setBooks(data.items.slice(0, 6)); // Display first 6 books for layout purposes
      })
      .catch((error) => console.error('Error fetching books:', error));
  }, []);

  const handleBookClick = (book) => {
    navigate(`/book/${book.id}`, { state: { book } });
  };

  return (
    <div className="book-layout-container">
      <h2 className="section-heading">Popular titles in <span className="section-highlight">Motivation & Inspiration</span></h2>
      <p className="section-subtext">
        Blinkist brings you the powerful key ideas of books in 27 categories
      </p>
      <div className="book-display-grid">
        {books.map((book, index) => (
          <div
            key={index}
            className="book-item-card"
            onClick={() => handleBookClick(book)}
          >
            <img
              className="book-thumbnail"
              src={book.volumeInfo.imageLinks?.thumbnail}
              alt={book.volumeInfo.title}
            />
            <div className="book-details-wrapper">
              <h3 className="book-name-title">{book.volumeInfo.title}</h3>
              <p className="book-writer-name">{book.volumeInfo.authors?.join(', ')}</p>
              <p className="book-summary-text">{book.volumeInfo.description?.slice(0, 100)}...</p>
              <div className="book-info-meta">
                <span>{Math.floor(Math.random() * 40) + 10} min</span> {/* Random reading time */}
                <span>⭐{book.volumeInfo.averageRating || '4.0'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Title;
