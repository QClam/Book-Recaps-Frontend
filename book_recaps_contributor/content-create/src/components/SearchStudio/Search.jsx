import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import '../SearchStudio/Search.scss';

Modal.setAppElement('#root');

const Search = () => {
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

    // Close manual entry form when the search query changes
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
        setIsManualEntryFormOpen(false); // Hide manual entry form when the search is cleared
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchBooks = async () => {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=AIzaSyB2so12nLWU0PHbITbm65e2HXPKs52ua_c`
    );
    const data = await response.json();
    setSearchResults(data.items || []);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsManualEntryFormOpen(false); // Hide manual entry form when search is cleared
  };

  const handleBookClick = (bookId) => {
    navigate('/draft-book', { state: { bookId } });
  };

  return (
    <div className="studio-container">
      <div className="studio-options">
        <div className="studio-option" onClick={openBookModal}>
          <span className="icon">📚</span>
          <span className="label">Book</span>
        </div>
        <div className="studio-option">
          <span className="icon">➕</span>
          <span className="label">New Post</span>
        </div>
        <div className="studio-option">
          <span className="icon">🔗</span>
          <span className="label">Link</span>
        </div>
        <div className="studio-option">
          <span className="icon">🎥</span>
          <span className="label">Video</span>
        </div>
        <div className="studio-option">
          <span className="icon">🎧</span>
          <span className="label">Podcast</span>
        </div>
      </div>

      <Modal
        isOpen={isBookModalOpen}
        onRequestClose={closeBookModal}
        contentLabel="Book Modal"
        overlayClassName="book-modal-overlay"
        className="book-modal"
      >
        {/* ✖️ Button to close the modal */}
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
              <p>Không tìm thấy thông tin sách</p>
              <button className="manual-entry-btn" onClick={() => setIsManualEntryFormOpen(true)}>
                Tự nhập thông tin sách
              </button>
            </div>
          )
        )}

        {/* The manual entry form only appears when the "Tự nhập thông tin sách" button is clicked */}
        {isManualEntryFormOpen && (
          <div className="manual-entry-form">
            <h3>Nhập thông tin sách</h3>
            <input type="text" placeholder="Tên sách" />
            <input type="text" placeholder="Tác giả" />
            <input type="text" placeholder="Nhà xuất bản" />
            <button className="submit-btn">Lưu thông tin</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Search;
