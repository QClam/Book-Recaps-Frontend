import React, { useEffect, useState, useRef } from 'react';
import '../ForYou/BookCarousel.scss';

const BookCarousel = () => {
  const [books, setBooks] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    fetch('https://www.googleapis.com/books/v1/volumes?q=love&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc')
      .then((response) => response.json())
      .then((data) => {
        setBooks(data.items.slice(0, 6)); // Display 6 books
      })
      .catch((error) => console.error('Error fetching books:', error));
  }, []);

  // Scroll the carousel to the left
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft -= 300; // Scroll to the left
    }
  };

  // Scroll the carousel to the right
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += 300; // Scroll to the right
    }
  };

  return (
    <div className="carousel-wrapper">
      <button className="arrow left-arrow" onClick={scrollLeft}>
        &lt;
      </button>
      <div className="carousel-container" ref={carouselRef}>
        {books.map((book, index) => (
          <div key={index} className="book-car">
            <img
              src={book.volumeInfo.imageLinks?.thumbnail}
              alt={book.volumeInfo.title}
              className="book-thumbnail"
            />
            <div className="book-info">
              <h3 className="book-title">{book.volumeInfo.title}</h3>
              <p className="book-meta">
                {book.volumeInfo.pageCount} Pages &nbsp;•&nbsp; Chapter {Math.floor(Math.random() * 20) + 1}
              </p>
              <p className="book-status">
                {index % 2 === 0 ? 'Last Read' : 'Yet to Read'}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button className="arrow right-arrow" onClick={scrollRight}>
        &gt;
      </button>
    </div>
  );
};

export default BookCarousel;
