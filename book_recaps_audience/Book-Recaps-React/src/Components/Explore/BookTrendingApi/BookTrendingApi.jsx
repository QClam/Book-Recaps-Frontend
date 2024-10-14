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
    try {
      const response = await axios.get(
        'https://160.25.80.100:7124/api/book/getallbooks',
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NWRmM2ExZC04NWY5LTQ2MzMtYTAwZC01ZTg0MjFiZWI3ZTQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTE2LjExMC40MS45MCIsImltYWdlX3VybCI6IkZpbGVzL0ltYWdlL2pwZy9hZC5qcGciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb250cmlidXRvciIsImV4cCI6MTcyODIyODA3NiwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzEyNCIsImF1ZCI6ImJvb2tyZWNhcCJ9.S6zTH1h6IdHOHndAtLhY7B_rVcnSBb1-Elqii75QX4Q`,
          },
        }
      );
      const booksData = response.data.data.$values; // Extract book data from API response
      setBooks(booksData);
    } catch (error) {
      console.error('Error fetching the books:', error);
    }
  };

  const handleBookClick = (book) => {
    navigate('/book-trending-detail', { state: { book } }); // Navigate to book detail page
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
          dots: false, // Disable dots in responsive view as well
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
          dots: false, // Disable dots
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false, // Disable dots
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
          <div key={book.id} className="book-item-trend" onClick={() => handleBookClick(book)}>
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
