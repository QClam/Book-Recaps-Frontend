import React from 'react';
import './Settings.scss';
import { useNavigate } from 'react-router-dom';

function Settings() {
    const navigate = useNavigate(); // Create a navigate function

  const handleViewApplication = () => {
    navigate('/application'); // Navigate to the Application route
  };
  const handleViewBilling = () => {
    navigate('/billing'); // Navigate to the Application route
  };
    return (
        <div className="settings-container">
            <div className="settings-nav">
                <ul>
                    <li className="active">Profile</li>
                    <li>Password</li>
                    <li>Email Notifications</li>
                   
                    <li>
                        <p onClick={handleViewBilling}>Billing</p> {/* Use button instead of Link */}
                    </li>
                    <li>
                        <p onClick={handleViewApplication}>View Application</p> {/* Use button instead of Link */}
                    </li>
                </ul>
            </div>
            <div className="settings-content">
                <h2>Basic Info</h2>
                <div className="info-group">
                    <div className="info-item">
                        <label>Name</label>
                        <span>Padam Boora</span>
                    </div>
                    <div className="info-item">
                        <label>Username</label>
                        <span>Padamboora</span>
                    </div>
                    <div className="info-item">
                        <label>Email ID</label>
                        <span>PadamBoora@gmail.com</span>
                    </div>
                    <div className="info-item">
                        <label>Location</label>
                        <span>Gurgaon</span>
                    </div>
                    <div className="info-item">
                        <label>Website</label>
                        <span>vizualzoom.com</span>
                    </div>
                </div>
                <div className="bio-section">
                    <h2>Bio</h2>
                    <p>A passionate designer who can effectively design your product information on the web and make the user's life easier.</p>
                </div>
                <button className="update-button">Update Account Settings</button>
                <div className="skills-section">
                    <h2>Your Skills</h2>
                    <ul>
                        <li>User Interface Design</li>
                        <li>Visual Design</li>
                        <li>Icons</li>
                        <li>Logo</li>
                        <li>App Icon</li>
                        <li>Material Design</li>
                        <li>iOS Design</li>
                        <li>Photoshop</li>
                        <li>Interaction Design</li>
                        <li>Creative</li>
                        <li>Sketch</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Settings;
