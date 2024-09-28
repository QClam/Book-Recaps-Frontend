import React from 'react';
import '../DraftBook/DraftBook.scss'; 

const DraftBook = ({ book }) => {
  return (
    <div className="draft-book-container">
      <div className="draft-book-header">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Deepstash_Logo.png/600px-Deepstash_Logo.png" alt="Logo" className="deepstash-logo" />
        <button className="feedback-button">Send feedback</button>
        <button className="exit-studio-button">Exit Studio</button>
        <div className="user-avatar"> {/* User avatar here */}
          <img src="https://via.placeholder.com/40" alt="User Avatar" className="user-avatar-image" />
        </div>
      </div>

      <div className="book-detail-section">
        <div className="book-cover">
          <img src={book.coverImage} alt={book.title} />
        </div>
        <div className="book-info">
          <h1>{book.title}</h1>
          <p>{book.authors.join(', ')}</p>
          <button className="publish-button">PUBLISH</button>
          <button className="more-options-button">...</button>
        </div>
      </div>

      <div className="add-context-section">
        <textarea placeholder="Add context for this post..."></textarea>
        <div className="context-options">
          <button className="context-option"><i className="fas fa-align-left"></i> Text</button>
          <button className="context-option"><i className="fas fa-quote-left"></i> Quote</button>
          <button className="context-option"><i className="fas fa-image"></i> Image</button>
        </div>
      </div>
    </div>
  );
};

export default DraftBook;
