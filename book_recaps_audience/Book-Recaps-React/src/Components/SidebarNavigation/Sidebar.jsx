import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JKROW from "../../image/jkrow.jpg";
import { SidebarItems } from "./SidebarItems";
import "../SidebarNavigation/css/Sidebar.scss";
import bookRecap from '../../image/removeBR.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (searchTerm.trim()) {
          navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      }
  };

  return (
    <div className="Sidebar">
      {/* Container for logo, sidebar list, and filter-section */}
      <div className="Sidebar-bar">
        {/* Logo */}
        <div className="SidebarLogo">
          <img src={bookRecap} alt="Logo" />
        </div>

        {/* Sidebar menu items */}
        <ul className="SidebarList">
          {SidebarItems.map((val, key) => (
            <li
              key={key}
              onClick={() => navigate(val.link)}
              className={`row ${window.location.pathname === val.link ? "active" : ""}`}
            >
              <div id="icon">{val.icon}</div>
              <div id="title">{val.title}</div>
            </li>
          ))}
        </ul>

        {/* Search, Notifications, and User Profile */}
        <div className="filter-sectionme">
          <form className="search-formme" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-inputme"
              placeholder="Search by author or title"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button type="submit" className="search-buttonme">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
  
          <div className="user-info">
            <FontAwesomeIcon icon={faBell} className="iconHeader" />
            <FontAwesomeIcon icon={faEnvelope} className="iconHeader" />
            <div className="user-profile">
              <span className="user-name">Abhishek</span>
              <img src={JKROW} alt="User Avatar" className="user-avatar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
