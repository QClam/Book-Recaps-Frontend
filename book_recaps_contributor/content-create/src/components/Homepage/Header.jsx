// Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Homepage/Header.scss';
import { FaBell, FaUserCircle, FaCog, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
const Header = ({ toggleDropdown, showDropdown }) => {
  const navigate = useNavigate();

  const handleWriteClick = () => {
    navigate('/studio');
  };

  return (
    <div className="header">
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
            <div className="dropdown-item">
              <FaUserCircle className="dropdown-icon" />
              Profile
            </div>
            <div className="dropdown-item">
              <FaCog className="dropdown-icon" />
              Settings
            </div>
            <div className="dropdown-item">
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
  );
};

export default Header;
