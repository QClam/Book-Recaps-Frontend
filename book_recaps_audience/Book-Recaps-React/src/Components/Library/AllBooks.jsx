import React, { useEffect, useState } from 'react';
import "../Library/AllBooks.scss";
import { FaSave } from 'react-icons/fa';
import axios from 'axios';

function AllBooks() {
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
          readTime: `${Math.floor(Math.random() * 30) + 10} min`, // Dummy read time
          rating: item.volumeInfo.averageRating || '4.0'
        }));
        setBooks(bookData);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="book-library-container">
      <h2>
        <FaSave /> All Saved Books
      </h2>
      <div className="book-library-grid">
        {books.map((book, index) => (
          <div className="book-library-card" key={index}>
            <img src={book.imageUrl} alt={book.title} className="book-library-image" />
            <h3 className="book-library-title">{book.title}</h3>
            <p className="book-library-author">{book.author}</p>
            <p className="book-library-description">{book.description}</p>
            <div className="book-library-details">
              <span>{book.readTime}</span>
              <span>⭐ {book.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllBooks;
