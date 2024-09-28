import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Explore/PopularBook/PopularBook.scss';

const PopularBook = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      'https://www.googleapis.com/books/v1/volumes?q=dad&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc'
    )
      .then((response) => response.json())
      .then((data) => {
        const items = data.items.map((item) => {
          const volumeInfo = item.volumeInfo;
          return {
            title: volumeInfo.title,
            authors: volumeInfo.authors?.join(', ') || 'Unknown Author',
            image: volumeInfo.imageLinks?.thumbnail || 'default-book-cover.png',
            price: (Math.random() * 10 + 1).toFixed(2), // Random price for demo
          };
        });
        setBooks(items);
      })
      .catch((error) => console.error('Error fetching books:', error));
  }, []);

  const handleShowAllClick = () => {
    navigate('/popular-books-detail');
  };

  return (
    <div className="popular-books-container">
      <div className="popular-books-header">
        <h2>Popular books</h2>
        <a onClick={handleShowAllClick} className="show-all-button">
          Show all
        </a>

      </div>
      <div className="book-grid">
        {books.map((book, index) => (
          <div key={index} className="book-item">
            <img src={book.image} alt={book.title} className="book-cover" />
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">{book.authors}</p>
            <p className="book-price">4.89K</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularBook;
