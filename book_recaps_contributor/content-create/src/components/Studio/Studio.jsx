import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import '../Studio/Studio.scss';

Modal.setAppElement('#root');

const Studio = () => {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isManualEntryFormOpen, setIsManualEntryFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const openBookModal = () => {
    setIsBookModalOpen(true);
  };

  const closeBookModal = () => {
    setIsBookModalOpen(false);
    setIsManualEntryFormOpen(false); // Close manual form if open
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (isManualEntryFormOpen && value.trim() === '') {
      setIsManualEntryFormOpen(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        searchBooks();
      } else {
        setSearchResults([]);
        setIsManualEntryFormOpen(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchBooks = async () => {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc`
    );

    const data = await response.json();
    setSearchResults(data.items || []);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsManualEntryFormOpen(false);
  };

  const handleBookClick = (bookId) => {
    navigate('/draft-book', { state: { bookId } });
  };

  return (
    <div className="studio-container">
      {/* <header className="studio-header">
        <div className="logo">
          <img src="logo.png" alt="Deepstash Studio" />
          <span className="studio-title">deepstash <strong>STUDIO</strong></span>
        </div>
        <div className="header-options">
          <button className="feedback-button">Send feedback</button>
          <button className="exit-button">Exit Studio</button>
          <div className="profile-icon">👤</div>
        </div>
      </header> */}

      <main className="studio-main">
        <div className="post-options">
          <h1>Add New Post</h1>
          <p>Start with a blank post or pick a source</p>
          <div className="option-grid">
            <div className="option-card" onClick={openBookModal}>
              <div className="option-icon">📚</div>
              <div className="option-label">Book</div>
            </div>
            <div className="option-card" onClick={() => navigate('/editor')}>
              <div className="option-icon">➕</div>
              <div className="option-label">New Post</div>
            </div>
            <div className="option-card">
              <div className="option-icon">🔗</div>
              <div className="option-label">Link</div>
            </div>
            <div className="option-card">
              <div className="option-icon">🎥</div>
              <div className="option-label">Video</div>
            </div>
            <div className="option-card">
              <div className="option-icon">🎧</div>
              <div className="option-label">Podcast</div>
            </div>
          </div>
        </div>

        <div className="info-panel">
          <h2>START IDEA CREATION FROM HERE</h2>
          <p>This is where you can add ideas from. If you want to add ideas from a particular source, such as a book or link, add it first. If you want a standard post with no particular source, start with a New Post.</p>
        </div>
      </main>

      <Modal
        isOpen={isBookModalOpen}
        onRequestClose={closeBookModal}
        contentLabel="Book Modal"
        overlayClassName="book-modal-overlay"
        className="book-modal"
      >
        <span className="close-modal" onClick={closeBookModal}>
          ✖️
        </span>

        <h2>Book</h2>
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Search for a book"
            className="book-search-input"
          />
          {searchQuery && (
            <span className="clear-search" onClick={clearSearch}>
              ✖️
            </span>
          )}
        </div>

        <img
          src="https://cdn.prod.website-files.com/5f6cc9cd16d59d990c8fca33/65280f778e021b880b53d530_books-and-reading-quotes-famous-6.jpg"
          alt="Book"
          className="book-modal-banner"
        />

        {searchResults.length > 0 ? (
          <div className="book-results">
            {searchResults.map((book) => (
              <div
                key={book.id}
                className="book-result"
                onClick={() => handleBookClick(book.id)}
              >
                <img
                  src={book.volumeInfo.imageLinks?.thumbnail || 'default-thumbnail.jpg'}
                  alt={book.volumeInfo.title}
                  className="book-thumbnail"
                />
                <div className="book-info">
                  <p><strong>Title:</strong> {book.volumeInfo.title}</p>
                  <p><strong>Author(s):</strong> {book.volumeInfo.authors?.join(', ')}</p>
                  <p><strong>Publisher:</strong> {book.volumeInfo.publisher}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          searchQuery && (
            <div className="no-results">
              <p>No books found</p>
              <button className="manual-entry-btn" onClick={() => navigate('/book-info')}>
                Manually Enter Book Info
              </button>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default Studio;
