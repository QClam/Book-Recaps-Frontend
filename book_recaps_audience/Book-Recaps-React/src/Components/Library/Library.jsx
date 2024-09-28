import React, { useEffect, useState } from 'react';
import { FaSave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle } from 'react-icons/fa';
import '../Library/Library.scss';

function Library() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=react&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc');
        const bookData = response.data.items.map(item => ({
          title: item.volumeInfo.title,
          author: item.volumeInfo.authors?.[0] || 'Unknown Author',
          description: item.volumeInfo.description?.substring(0, 50) + '...' || 'No description available',
          imageUrl: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150',
          readTime: `${Math.floor(Math.random() * 30) + 10} min`,
          rating: item.volumeInfo.averageRating || '4.0'
        }));
        setBooks(bookData);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const firstFiveBooks = books.slice(0, 5);

  return (
    <div className="library-wrapper">
      <div className="library-header">
        <h2>
          <FaSave /> Saved Books
        </h2>
        <Link to="/all-books" className="library-see-all-link">See All →</Link>
      </div>
      <div className="library-grid">
        {firstFiveBooks.map((book, index) => (
          <div className="library-book" key={index}>
            <img src={book.imageUrl} alt={book.title} className="library-book-image" />
            <h3 className="library-book-title">{book.title}</h3>
            <p className="library-book-author">{book.author}</p>
            <p className="library-book-description">{book.description}</p>
            <div className="library-book-info">
              <span>{book.readTime}</span>
              <span>⭐ {book.rating}</span>
            </div>
          </div>
        ))}
      </div>

      <h2>
        <FaCheckCircle /> Finished Books
      </h2>
      <p>No items</p>
      <div className="library-finished-message">
        <h3>Done and dusted!</h3>
        <h4>When you finish a title, you can find it here later.</h4>
      </div>
    </div>
  );
}

export default Library;
