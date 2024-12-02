import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './BookTrendingApi.scss';
import { useNavigate } from 'react-router-dom';

// Custom Arrow component for left arrow
const PrevArrow = ({ className, style, onClick }) => (
  <div
    className={className}
    style={{
      ...style,
      display: 'block',
      background: 'transparent',
    }}
    onClick={onClick}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0000FF" width="48px" height="48px">
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
      background: 'transparent',
      display: 'block',
    }}
    onClick={onClick}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0000FF" width="48px" height="48px">
      <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
    </svg>
  </div>
);

const BookTrendingApi = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const accessToken = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      const response = await axios.get(
        'https://bookrecaps.cloud/api/book/getallbooks',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const booksData = response.data.data.$values; // Extract book data from API response
      setBooks(booksData);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // If the token is expired, refresh the token
        await handleTokenRefresh(refreshToken);
        // Retry fetching the books after refreshing the token
        fetchBooks();
      } else {
        console.error('Error fetching the books:', error);
      }
    }
  };

  const handleTokenRefresh = async (refreshToken) => {
    try {
      const response = await axios.post('https://bookrecaps.cloud/api/tokens/refresh', {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      // Update localStorage with new tokens
      localStorage.setItem('authToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Optionally handle logout or redirect to login if refreshing the token fails
    }
  };

  const handleBookClick = (id) => {
    navigate(`/bookdetailbook/${id}`); // Use the book's id for navigation
  };

  const settings = {
    dots: false, // Disable dots
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
          dots: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
        },
      },
    ],
  };

  return (
    <div className="book-container-trend">
      <h2>Trending</h2>
      <p>What's popular right now</p>
      <Slider {...settings}>
        {books.map((book) => (
          <div key={book.id} className="book-item-trend" onClick={() => handleBookClick(book.id)}>
            <img
              src={book.coverImage || 'https://via.placeholder.com/150'}
              alt={book.title}
            />
            <h3>{book.title}</h3>
            <p>{book.authors?.$values?.[0]?.name || 'Unknown Author'}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BookTrendingApi;
