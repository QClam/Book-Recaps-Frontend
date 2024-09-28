import React, { useState, useEffect } from 'react';
import '../BookCategory/BookCategory.scss';
import { useNavigate } from 'react-router-dom';

const BookCategory = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  // Fetch books from the Google Books API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(
          'https://www.googleapis.com/books/v1/volumes?q=woman&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc'
        );
        const data = await response.json();
        setBooks(data.items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching books:', error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleBookClick = (book) => {
    navigate(`/bookcategory/${book.id}`, { state: { book } });
  };

  return (
    <div className="book-category-container">
      {/* Left Sidebar - Categories */}
      <div className="category-sidebar">
        <h3>Categories</h3>
        <ul>
          <li>All</li>
          <li>Fiction & Literature</li>
          <li>Science Fiction</li>
          <li>Fantasy</li>
          <li>Mystery</li>
          <li>Non-Fiction</li>
          <li>Business</li>
          <li>History</li>
          <li>Comics</li>
          {/* Add more categories as needed */}
        </ul>
      </div>

      {/* Book Grid */}
      <div className="book-grid">
        <div className="book-filters">
          <button>Best Sellers</button>
          <button>New Arrivals</button>
          <button>Used Books</button>
          <button>Special Offers</button>
        </div>

        <div className="books-container">
          {books.map((book, index) => (
            <div className="book-item" key={index} 
           
            onClick={() => handleBookClick(book)}>
              <div className="book-image">
                <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
              </div>
              <div className="book-details">
                <h4>{book.volumeInfo.title}</h4>
                <p className="book-price">$ {Math.floor(Math.random() * 50) + 10}</p>
                <div className="sale-badge">30% Off</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination (optional) */}
        <div className="pagination">
          <button>1</button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <button>5</button>
          <button>6</button>
        </div>
      </div>
    </div>
  );
};

export default BookCategory;
