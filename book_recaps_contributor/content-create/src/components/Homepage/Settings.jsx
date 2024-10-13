import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../Homepage/Settings.scss';
import { FaUser, FaLock, FaFileAlt, FaBell, FaPen } from 'react-icons/fa';
import Header from './Header';
import HeaderLayout from '../Layout/HeaderLayout';

const Settings = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Function to handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    navigate('/profile'); // Navigate back to the Profile page
  };

  return (
    <div className="settings-wrapper">
      <HeaderLayout toggleDropdown={toggleDropdown} showDropdown={showDropdown} />
      <div className="settings-content-section">
        <div className="settings-sidebar">
          <div className="settings-sidebar-section">
            <h3>Dashboard</h3>
            <ul>
              <li><FaFileAlt className="settings-sidebar-icon" /> Recaps</li>
              <li><FaBell className="settings-sidebar-icon" /> Notifications</li>
              <li><FaPen className="settings-sidebar-icon" /> Write</li>
            </ul>
          </div>
          <div className="settings-sidebar-section">
            <h3>Settings</h3>
            <ul>
              <li className="settings-sidebar-item-active"><FaUser className="settings-sidebar-icon" /> Edit Profile</li>
              <li><FaLock className="settings-sidebar-icon" /> Change Password</li>
            </ul>
          </div>
        </div>
        <div className="settings-main-content">
          <h2>Edit Profile</h2>
          <div className="profile-picture-wrapper">
            <div className="profile-picture-container">
              <img src="/path/to/profile-picture.png" alt="Profile" />
              <button className="upload-button">Upload Image</button>
            </div>
          </div>
          <form className="profile-form-section" onSubmit={handleFormSubmit}> {/* Add onSubmit handler */}
            <div className="form-group-wrapper">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" placeholder="kunaal" />
            </div>
            <div className="form-group-wrapper">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="kunaal@gmail.com" />
            </div>
            <div className="form-group-wrapper">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" placeholder="Bio" maxLength={200}></textarea>
              <small>200 characters left</small>
            </div>
            <div className="form-group-wrapper">
              <label htmlFor="social">Add Your Social Handles below</label>
              <input type="text" id="social-youtube" placeholder="YouTube" />
              <input type="text" id="social-instagram" placeholder="Instagram" />
              <input type="text" id="social-facebook" placeholder="Facebook" />
              <input type="text" id="social-twitter" placeholder="Twitter" />
              <input type="text" id="social-github" placeholder="GitHub" />
              <input type="text" id="social-website" placeholder="Website" />
            </div>
            <button type="submit" className="update-profile-button">Update</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
