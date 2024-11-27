import React, { useState, useEffect }  from 'react';
import "../SidebarNavigation/css/Sidebar.scss"
import { useNavigate } from "react-router-dom";
import { NavLink } from 'react-router-dom';
import { SidebarItems } from './SidebarItems'; // Import các mục điều hướng
import LogoBR from "../../assets/removeBR.png";
const Sidebar = () => {
  const navigate = useNavigate();
  const [publisherName, setPublisherName] = useState(""); 

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('authToken');
      try {
        // Gọi API đầu tiên để lấy `id`
        const profileResponse = await fetch('https://160.25.80.100:7124/api/personal/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const profileData = await profileResponse.json();
        const profileId = profileData?.id;

        if (!profileId) {
          throw new Error("Profile ID not found");
        }

        // Gọi API thứ hai với `id` để lấy dữ liệu nhà xuất bản
        const publisherResponse = await fetch(
          `https://160.25.80.100:7124/api/publisher/getbypublisheruser/${profileId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!publisherResponse.ok) {
          throw new Error("Failed to fetch publisher data");
        }

        const publisherData = await publisherResponse.json();
        setPublisherName(publisherData?.publisherName || "Unknown Publisher"); // Lưu `publisherName` vào state
      } catch (error) {
        console.error("Error fetching data:", error);
        setPublisherName("Error fetching publisher"); // Hiển thị lỗi nếu có
      }
    };

    fetchData();
  }, []);


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
      <p className="publisher-name">{publisherName}</p>
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
          Đăng xuất
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
