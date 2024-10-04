import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../BookDetail/BookDetail.scss';

const BookDetail = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const book = location.state?.book;

  if (!book) return <div>Loading...</div>;

  const handleSaveInLibrary = () => {
    alert("Book saved in your library!");
  };
  // Navigate to BookDetailRecap with the current book
  const handleNavigateToRecap = () => {
    navigate('/book-detail-recap', { state: { book } });
  };
  return (
    <div className="book-detail-container">
      <div className="book-detail-content">
        <div className="book-header">
          <div className="book-thumbnail">
            <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
          </div>
          <div className="book-info">
            <h1 className="book-title">{book.volumeInfo.title}</h1>
            <div className="author-container">
              <h2 className="book-author">{book.volumeInfo.authors?.join(', ')}</h2>
              <button className="following-button" onClick={handleNavigateToRecap}>Recaps</button>

            </div>
            <p className="book-subtitle">{book.volumeInfo.subtitle || 'No subtitle available'}</p>
            <div className="book-detail-meta">
              <div className="meta-row">
                <div className="meta-icon meta-rating">
                  ⭐ <span>{book.volumeInfo.averageRating || '4.5'}</span> ({book.volumeInfo.ratingsCount || '1115'} ratings)
                </div>
                <div className="meta-icon meta-duration">
                  ⏱ <span>20 mins</span>
                </div>
              </div>
              <div className="meta-row">
                <div className="meta-icon meta-format">
                  🎧 Audio & text
                </div>
                <div className="meta-icon meta-key-ideas">
                  💡 9 Key ideas
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="book-saved">
          <span className="saved-label" onClick={handleSaveInLibrary}>🔖 Save in My Library</span>
        </div>

        <div className="book-category">
          <span className="category-label">Category: {book.volumeInfo.categories?.join(', ') || 'Unknown'}</span>
        </div>

        <div className="book-description">
          <p>{book.volumeInfo.description || "No description available."}</p>
        </div>
       
      </div>
    </div>
  );
};

export default BookDetail;
