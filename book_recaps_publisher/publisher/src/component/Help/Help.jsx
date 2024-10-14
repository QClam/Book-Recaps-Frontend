import React from 'react';
import './Help.scss'; // Import CSS cho Help
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Import các icon
import { useNavigate } from 'react-router-dom';

const Help = () => {
  const navigate = useNavigate(); // Khởi tạo hàm điều hướng

  const handleReportClick = () => {
    navigate('/report'); // Điều hướng đến trang Report
  };
  return (
    <div className="help-container">
      <div className="help-header">
        <div className="help-search-container">
          <input type="text" placeholder="Search" className="help-search-input" />
        </div>
      </div>
      
      <div className="help-content">
        <div className="help-categories">
          <div className="category-button">About Blinkist</div>
          <div className="category-button">Using Blinkist</div>
          <div className="category-button">Known Issues and Updates</div>
          <div className="category-button">Subscriptions</div>
          <div className="category-button" onClick={handleReportClick}>Send Application</div>
          <div className="category-button">Get in touch with us</div>
        </div>
        
        <div className="promoted-articles">
          <h2>Promoted articles</h2>
          <div className="articles-list">
            <div className="article-item">What happened to Spaces?</div>
            <div className="article-item">We’re discontinuing support for Audiobooks</div>
            <div className="article-item">Go1 acquires Blinkist!</div>
            <div className="article-item">You can now find all of our updates in one place!</div>
            <div className="article-item">Playback keeps stopping on my Android device.</div>
            <div className="article-item">App shows weird behavior?</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {/* <div className="help-footer">
        <div className="footer-left">
          Blinkist.com | Blinkist Magazine | Podcast Simplify | Legal Notice | Terms of Service | Privacy Policies
        </div>
        <div className="footer-right">
          <FaFacebook className="footer-icon" />
          <FaInstagram className="footer-icon" />
          <FaLinkedin className="footer-icon" />
        </div>
      </div> */}
    </div>
  );
}

export default Help;
