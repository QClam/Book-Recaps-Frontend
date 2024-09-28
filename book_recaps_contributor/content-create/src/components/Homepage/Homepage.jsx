import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaMoon, FaCog, FaQuestionCircle, FaSignOutAlt, FaMobileAlt } from 'react-icons/fa';
import './Homepage.scss';

const Homepage = () => {
  const [books, setBooks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://www.googleapis.com/books/v1/volumes?q=react&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc')
      .then(response => response.json())
      .then(data => {
        setBooks(data.items || []);
      })
      .catch(error => console.error("Error fetching data: ", error));
  }, []);

  const handleWriteClick = () => {
    navigate('/studio');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // New function to handle navigation to Settings
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // Add a new function to handle navigation to Profile
  const handleProfileClick = () => {
  navigate('/profile'); // Assuming you have a route defined for /profile
  };

  const handleDashboardClick = () => {
    navigate('/dashboard'); // Assuming you have a route defined for /dashboard
    };


  return (
    <div className="homepage-container">
      {/* <div className="homepage-header">
        <h1>Deepstash</h1>
        <input type="text" placeholder="Ideas, topics & more..." className="search-bar" />
        <div className="user-options">
          <button className="write-button" onClick={handleWriteClick}>
            Write in Studio
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
      </div> */}

      <div className="navigation-menu">
        <button className="nav-button active">Daily Picks</button>
        <button className="nav-button">Recommended</button>
        <button className="nav-button">Following</button>
        <button className="nav-button">Collections</button>
      </div>

      <div className="content-container">
        <div className="daily-picks">
          <h2>Daily Picks</h2>
          {books.length > 0 ? (
            books.map(book => (
              <div className="book-info" key={book.id}>
                <p>{book.volumeInfo.authors?.join(', ')}</p>
                <h3>{book.volumeInfo.title}</h3>
                <p>{book.volumeInfo.publisher}</p>
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
