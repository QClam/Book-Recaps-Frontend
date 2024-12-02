import React from 'react';
import '../Report/Report.scss';
import { useNavigate } from 'react-router-dom';
import { routes } from "../../../routes";

const Report = () => {
  const navigate = useNavigate(); // Khởi tạo hàm điều hướng

    const handleHomeClick = () => {
      navigate(routes.explore); // Điều hướng đến trang chủ
    };

  return (
    <div className="report-container">
      <button className="home-button" onClick={handleHomeClick}>Home</button>

      <h1>Support Request</h1>
      <p>
        Fill out the form below, or send us an email directly at 
        <a href="mailto:help@shortform.com"> help@bookrecaps.com</a>
      </p>
      <div className="report-form">
        <label htmlFor="subject">To get more help, write a descriptive subject</label>
        <input
          type="text"
          id="subject"
          placeholder="Enter subject here"
        />
        
        <label htmlFor="request">Request</label>
        <textarea
          id="request"
          rows="4"
          placeholder="How can we help?"
        />
        
        <button className="send-button">Send request</button>
      </div>
      
    </div>
  );
};

export default Report;
