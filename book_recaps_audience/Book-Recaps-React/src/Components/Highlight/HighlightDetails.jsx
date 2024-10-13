import React from 'react';
import './HighlightDetails.scss';
import { FaClipboard } from 'react-icons/fa';

const HighlightDetails = () => {
  const highlights = ['drastically', 'modern']; // Replace with actual highlights

  return (
    <div className="highlight-details-container">
      <div className="highlight-details-left">
        <h2 className="highlight-details-title">The Success Myth</h2>
        <h3 className="highlight-details-subtitle">Letting Go of Having It All</h3>
        <div className="underline"></div>
        <div className="highlight-header">
          <h3 className="your-highlights-title">Your Highlights</h3>
          <button className="copy-all-button">Copy all</button>
        </div>
        <div className="highlight-details-list">
          {highlights.map((highlight, index) => (
            <div className="highlight-item" key={index}>
              <span>{highlight}</span>
              <FaClipboard className="highlight-copy-icon" />
            </div>
          ))}
        </div>
      </div>
      <div className="highlight-details-right">
        <img
          src="https://m.media-amazon.com/images/M/MV5BNmQ0ODBhMjUtNDRhOC00MGQzLTk5MTAtZDliODg5NmU5MjZhXkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_.jpg"
          alt="The Success Myth"
          className="highlight-book-cover"
        />
        <button className="view-blink-button">View Blink</button>
      </div>
    </div>
  );
};

export default HighlightDetails;
