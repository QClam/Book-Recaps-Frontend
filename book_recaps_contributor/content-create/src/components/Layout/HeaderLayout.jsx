import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaCog, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import '../Layout/HeaderLayout.scss';

const HeaderLayout = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false); // Quản lý việc hiển thị form
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const delayDebounceFn = setTimeout(() => {
        searchBooks();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchBooks = async () => {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc`
    );
    const data = await response.json();
    setSearchResults(data.items || []);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleWriteClick = () => {
    navigate('/studio');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="homepage-container">
      <div className="homepage-header">
        <h1>BookRecaps</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Ideas, topics & more..."
          className="search-bar"
        />
        {searchQuery && (
          <span className="clear-search" onClick={clearSearch}>
            ✖️
          </span>
        )}
        <div className="user-options">
          <button className="write-button" onClick={handleWriteClick}>
            Write Recaps
          </button>
          <FaBell className="icon notification-icon" />
          <FaUserCircle className="icon profile-icon" onClick={toggleDropdown} />

          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleProfileClick}>
                <FaUserCircle className="dropdown-icon" />
                Profile
              </div>
              <div className="dropdown-item" onClick={handleSettingsClick}>
                <FaCog className="dropdown-icon" />
                Settings
              </div>
              <div className="dropdown-item" onClick={handleDashboardClick}>
                <FaQuestionCircle className="dropdown-icon" />
                Dashboard
              </div>
              <div className="dropdown-item">
                <FaSignOutAlt className="dropdown-icon" />
                Sign Out
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Book Results */}
      <div className="book-section">
        {searchResults.length > 0 ? (
          <div className="book-results">
            {searchResults.map((book) => (
              <div key={book.id} className="book-result">
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

              {/* Hiển thị form khi nút được nhấn */}
              {showForm && (
                <form className="manual-entry-form">
                  <label>
                    Title:
                    <input type="text" placeholder="Enter book title" />
                  </label>
                  <label>
                    Author:
                    <input type="text" placeholder="Enter author(s)" />
                  </label>
                  <label>
                    Publisher:
                    <input type="text" placeholder="Enter publisher" />
                  </label>
                  <button type="submit">Submit</button>
                </form>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HeaderLayout;
