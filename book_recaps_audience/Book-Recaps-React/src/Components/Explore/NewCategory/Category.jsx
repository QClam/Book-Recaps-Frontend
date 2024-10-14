import React, { useEffect, useState } from 'react';
import '../NewCategory/Category.scss';
import axios from 'axios';

const CustomCategory = () => {
  const [books, setBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const apiKey = 'AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc';

  useEffect(() => {
    axios
      .get(`https://www.googleapis.com/books/v1/volumes?q=${activeCategory}&key=${apiKey}`)
      .then((res) => {
        const fetchedBooks = res.data.items.map((item) => ({
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Unknown',
          thumbnail: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : '',
          rating: item.volumeInfo.averageRating || 0,
        }));
        setBooks(fetchedBooks);
      })
      .catch((err) => console.log(err));
  }, [activeCategory]);

  return (
    <div className="custom-category-wrapper">
      <div className="custom-category-header">
        <h2 className="custom-title">Browse Categories</h2>
        <div className="custom-category-buttons">
          {['All', 'Sci-Fi', 'Fantasy', 'Drama', 'Business', 'Education', 'Geography'].map((cat) => (
            <button
              key={cat}
              className={`custom-button ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-books-grid">
        {books.map((book, index) => (
          <div key={index} className="custom-book-card">
            <img src={book.thumbnail} alt={book.title} className="custom-book-image" />
            <div className="custom-book-details">
              <h3 className="custom-book-title">{book.title}</h3>
              <p className="custom-book-author">{book.author}</p>
            </div>
            <div className="custom-book-rating">
              <span className="custom-heart">❤️</span>
              <span className="custom-rating-number">{book.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomCategory;
