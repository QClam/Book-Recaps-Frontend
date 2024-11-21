import React from 'react';
import "../SidebarNavigation/css/Sidebar.scss"
import { useNavigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import { SidebarItems } from './SidebarItems'; // Import các mục điều hướng
import LogoBR from "../../assets/removeBR.png";
const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Perform logout logic here (e.g., clear tokens, redirect to login page)
    localStorage.removeItem('authToken'); // Example: remove auth token
    navigate('/login'); // Redirect to login page
    console.log("Logout successful"); // Log success
  };
  return (
    <div className="sidebar">
      <div className="logo">
      
          <img src={LogoBR} alt="Logo" />
       
      </div>
      <ul className="nav-links">
        {SidebarItems.map((item, index) => (
          <li key={index}>
            <NavLink to={item.link} activeClassName="active" exact>
              {item.title}
              {/* <span>{item.title}</span> */}
            </NavLink>
          </li>
          
        ))}
        {/* Nút Logout */}
        <li onClick={handleLogout} className="logout">
          Logout
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
