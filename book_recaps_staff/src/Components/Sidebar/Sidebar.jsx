import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarItems } from "./SidebarItems";
import { fetchProfile } from "../Auth/Profile";

import avatar from "../../data/avatar.png"
import "../Sidebar/Sidebar.scss";
import { Logout } from "@mui/icons-material";

function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token")

  useEffect(() => {
    fetchProfile(token, setProfile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <div className={`Sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="SidebarLogo">
          {profile && (
            <div>
              <img src={avatar} alt="Pio NFT" />
              <h2>{profile.fullName}</h2>
            </div>
          )}
        </div>
        <ul className="SidebarList">
          {SidebarItems.map((val, key) => {
            return (
              <li
                key={key}
                onClick={() => {
                  navigate(val.link);
                  setIsSidebarOpen(false);
                }}
                className="row"
                id={window.location.pathname === val.link ? "active" : ""}
              >
                <div id="icon">{val.icon}</div>
                <div id="title">{val.title}</div>
              </li>
            );
          })}
          <li onClick={handleLogout} className="row">
            <div id="icon"><Logout /></div>
            <div id="title">Đăng xuất</div>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;
