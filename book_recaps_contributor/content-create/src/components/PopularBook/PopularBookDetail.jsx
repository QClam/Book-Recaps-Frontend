import React, { useEffect, useState } from 'react';
import '../PopularBook/PopularBookDetail.scss';

const PopularBookDetail = () => {
  const [books, setBooks] = useState([]);

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

  return (
    <div className="popular-books-detail-container">
      <div className="book-grid-detail">
        {books.map((book, index) => (
          <div key={index} className="book-item-detail">
            <img src={book.image} alt={book.title} className="book-cover-detail" />
            <h3 className="book-title-detail">{book.title}</h3>
            <p className="book-author-detail">{book.authors}</p>
            <p className="book-price-detail">4.89K</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularBookDetail;
