import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './BookTrending.scss';
import { useNavigate } from 'react-router-dom';
// Custom Arrow component for left arrow
const PrevArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{
      ...style,
      display: 'block',
      background: 'transparent', // No background
    }}
    onClick={onClick}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0000FF" width="48px" height="48px"> {/* Set size to 48px for twice the size */}
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  </div>
);



// Custom Arrow component for right arrow
const NextArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{
      ...style,
      background: 'transparent', // No background
      display: "block",
    }}
    onClick={onClick}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0000FF" width="48px" height="48px"> {/* Set size to 48px for twice the size */}
      <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
    </svg>
  </div>
);

const BookTrending = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/books/v1/volumes?q=love&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc'
      );
      setBooks(response.data.items);
    } catch (error) {
      console.error('Error fetching the books', error);
    }
  };

  const handleBookClick = (book) => {
    navigate('/book-trending-detail', { state: { book } }); // Navigate to BookTrendingDetail and pass book data
  };
  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    prevArrow: <PrevArrow />, // Custom left arrow
    nextArrow: <NextArrow />, // Custom right arrow
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className="book-container-trend">
      <h2>Trending</h2>
      <p>What's popular right now</p>
      <Slider {...settings}>
        {books.map((book, index) => (
          <div key={index} className="book-item-trend" onClick={() => handleBookClick(book)}>
            <img
              src={book.volumeInfo.imageLinks?.thumbnail}
              alt={book.volumeInfo.title}
            />
            <h3>{book.volumeInfo.title}</h3>
            <p>{book.volumeInfo.authors?.join(', ')}</p>
            {/* <p>{book.volumeInfo.description?.substring(0, 50)}...</p> */}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BookTrending;
