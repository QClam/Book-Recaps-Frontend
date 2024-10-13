import React from 'react';
import "../SidebarNavigation/css/Sidebar.scss"
import { NavLink } from 'react-router-dom';
import { SidebarItems } from './SidebarItems'; // Import các mục điều hướng
import LogoBR from "../../assets/removeBR.png";
const Sidebar = () => {
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
      </ul>
    </div>
  );
};

export default Sidebar;
