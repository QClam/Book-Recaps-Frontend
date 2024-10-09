import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarItems } from "./SidebarItems";

import avatar from "../../data/avarta.png"
import "../Sidebar/Sidebar.scss";

function Sidebar() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`Sidebar ${isSidebarOpen ? "open" : ""}`}>
      <div className="SidebarLogo">
        <img src={avatar} alt="Pio NFT" />
        <h2>Admin</h2>
      </div>
        <ul className="SidebarList">
          {SidebarItems.map((val, key) => {
            return (
              <li
                key={key}
                onClick={() => {
                  navigate(val.link);
                  setIsSidebarOpen(false); // Close sidebar on item click
                }}
                className="row"
                id={window.location.pathname === val.link ? "active" : ""}
              >
                <div id="icon">{val.icon}</div>
                <div id="title">{val.title}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  )
}

export default Sidebar