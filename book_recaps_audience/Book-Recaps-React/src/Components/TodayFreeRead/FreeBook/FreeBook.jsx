import React from 'react'; 
import '../FreeBook/FreeBook.scss'
import libraryImage from '../../../image/library.jpg';

const FreeBook = () => {
  return (
    <div className="free-book-container">
      <h1>Today's Free Book</h1>
      <p className="subtext">Key ideas from a different title daily—free for 24h!</p>
      <div className="book-card">
        <div className="book-image">
          <img src={libraryImage} alt="Problem Hunting" />
        </div>
        <div className="book-details">
          <span className="book-summary">Better than a summary</span>
          <h2>Problem Hunting</h2>
          <p className="book-author">by Brian Long</p>
          <p className="book-description">The Tech Startup Textbook</p>
          <div className="book-info">
            <span>⭐ 3.8 (16 ratings)</span>
            <span>⏱ 10 mins</span>
            <span>💡 5 key ideas</span>
          </div>
          <button className="start-now-button">Start now</button>
          <p className="free-text">Free—no sign up required</p>
        </div>
      </div>
    </div>
  );
};

export default FreeBook;
