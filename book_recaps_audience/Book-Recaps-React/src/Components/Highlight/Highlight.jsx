import React from 'react';
import '../Highlight/HighLight.scss';
import { FaPen, FaClipboard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation

const Highlight = () => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate('/highlight-details'); // Redirect to the highlights details page
  };

  return (
    <div className="highlight-container">
      <div className="highlight-header">
        <FaPen className="highlight-icon" />
        <h2 className="highlight-title">Highlights</h2>
        <p className="highlight-items">1 of 1 items</p>
      </div>
      <div className="highlight-book" onClick={handleBookClick}>
        <img
          src="https://m.media-amazon.com/images/M/MV5BNmQ0ODBhMjUtNDRhOC00MGQzLTk5MTAtZDliODg5NmU5MjZhXkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_.jpg" // Replace with book cover image URL
          alt="The Success Myth"
          className="highlight-book-cover"
        />
        <h3 className="highlight-book-title">The Success Myth</h3>
        <p className="highlight-book-subtitle">Letting Go of Having It All</p>
        <div className="highlight-details" onClick={handleBookClick}>
          <FaPen className="highlight-icon-small" />
          <span className="highlight-text">2 highlights</span>
        </div>
      </div>
    </div>
  );
};

export default Highlight;
