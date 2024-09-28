import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import Header from './Header';
import '../Homepage/Profile.scss'; // Import the CSS file for Profile component
import HeaderLayout from '../Layout/HeaderLayout';

const Profile = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Function to navigate to settings
  const handleEditProfileClick = () => {
    navigate('/settings'); // Navigate to the settings page
  };

  return (
    <div className="profile-container">
      <HeaderLayout toggleDropdown={toggleDropdown} showDropdown={showDropdown} />

      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-avatar">
            <img src="/path/to/avatar.png" alt="User Avatar" />
          </div>
          <div className="profile-details">
            <h3>@kunaal123</h3>
            <p>Kunaal</p>
            <p>0 Recaps - 0 Reads</p>
            <button className="edit-profile-button" onClick={handleEditProfileClick}>
              Edit Profile
            </button>
            <p>This is a test profile.</p>
            <div className="social-links">
              <i className="fa fa-instagram"></i> {/* Update with actual Instagram icon if needed */}
            </div>
            <p>Joined on 29 Sep 2024</p>
          </div>
        </div>
        <div className="profile-blogs">
          <h2>Recaps Published</h2>
          <div className="no-blogs">
            <p>No recaps published yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
