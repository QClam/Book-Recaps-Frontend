import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchFunction = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        searchBooks();
      } else {
        setSearchResults([]);
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
  };

  const handleBookClick = (bookId) => {
    navigate('/draft-book', { state: { bookId } });
  };

  return (
    <div className="studio-container">
      <main className="studio-main">
        {/* Search Bar and Book Results */}
        <div className="book-section">
          <h2>Search for a Book</h2>
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
        </div>
      </main>
    </div>
  );
};

export default SearchFunction;
