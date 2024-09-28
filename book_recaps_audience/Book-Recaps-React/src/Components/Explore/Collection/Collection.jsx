import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Collection.scss';
import axios from 'axios';

const Collection = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          'https://www.googleapis.com/books/v1/volumes?q=david&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc'
        );
        const books = response.data.items.map((book) => ({
          title: book.volumeInfo.title || "No Title",
          description: book.volumeInfo.description || "No Description",
          items: book.volumeInfo.pageCount || "No Page Count",
          image: book.volumeInfo.imageLinks?.thumbnail || "/path/to/default-image.jpg",
        }));
        setCollections(books);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
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
    <div className="collection-container">
      <h2>Latest collections</h2>
      <p>Collections recently created on Blinkist</p>
      <Slider {...settings}>
        {collections.map((collection, index) => (
          <div key={index} className="collection-card" >
            <div className="collection-image" style={{ backgroundImage: `url(${collection.image})` }}>
              {/* Add any overlay if needed */}
            </div>
            <h3>{collection.title}</h3>
            <h3>{collection.authors}</h3>
            {/* <p>{collection.description}</p> */}
            <span>{collection.items} pages</span>
          </div>
        ))}
      </Slider>
    </div>
  );
};

// Custom next arrow component
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
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
    </svg>
  </div>
);


const NextArrow = ({ className, style, onClick }) => (
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
      <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
    </svg>
  </div>
);
// Custom prev arrow component

export default Collection;
