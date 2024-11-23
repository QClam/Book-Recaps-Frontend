import React, { useEffect, useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './BookApiCategory.scss';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const BookApiCategory = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null); // For error handling
  const navigate = useNavigate(); // Khởi tạo navigate

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`); // Điều hướng tới trang danh sách sách theo category
  };
  //qua BookListCategory de nhin may cuon sach thuoc category nao
  // Get accessToken and refreshToken from localStorage
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://bookrecaps.cloud/api/category/getallcategory",
          {
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${accessToken}`, // Use the access token
            },
          }
        );

        const data = response.data;
        if (data && data.succeeded) {
          setCategories(data.data.$values);
        } else {
          setCategories([]); // Set empty array if no categories are present
        }
      } catch (error) {
        // If token is expired, try to refresh it
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchCategories(); // Retry fetching categories after refreshing the token
        } else {
          setError(error.message);
          console.error('Error fetching categories:', error);
        }
      }
    };

    fetchCategories();
  }, [accessToken, refreshToken]); // Use both tokens in dependency array

  // Token refresh function
  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://bookrecaps.cloud/api/tokens/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      // Update localStorage with new tokens
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Session expired. Please log in again.");
    }
  };

  const getIconClass = (categoryName) => {
    switch (categoryName) {
      case 'Thiên nhiên':
        return 'fas fa-tree'; // Icon for Nature
      case 'Khoa học':
        return 'fas fa-flask'; // Icon for Science
      case 'Khởi nghiệp':
        return 'fas fa-lightbulb'; // Icon for Entrepreneurship
      case 'Lịch sử thế giới':
        return 'fas fa-globe'; // Icon for World History
      case 'An bình nội tại':
        return 'fas fa-heart'; // Icon for Inner Peace
      case 'Tiểu thuyết':
        return 'fas fa-book'; // Icon for Novel
      case 'Triết học':
        return 'fas fa-brain'; // Icon for Philosophy
      case 'Quản lý doanh nghiệp':
        return 'fas fa-chart-line'; // Icon for Business Management
      case 'Nuôi dạy con':
        return 'fas fa-baby'; // Icon for Parenting
      case 'Kỹ năng giao tiếp':
        return 'fas fa-comments'; // Icon for Communication Skills
      case 'Đầu tư tài chính':
        return 'fas fa-dollar-sign'; // Icon for Financial Investment
      case 'Marketing - Bán hàng':
        return 'fas fa-bullhorn'; // Icon for Marketing and Sales
      case 'Tâm lý học':
        return 'fas fa-brain'; // Icon for Psychology
      case 'Phát triển bản thân':
        return 'fas fa-arrow-up'; // Icon for Self-Development
      case 'Vũ trụ':
        return 'fas fa-rocket'; // Icon for Universe
      case 'Tư duy lãnh đạo':
        return 'fas fa-user-tie'; // Icon for Leadership
      case 'Chính trị':
        return 'fas fa-balance-scale'; // Icon for Politics
      case 'Truyền động lực':
        return 'fas fa-microphone-alt'; // Icon for Motivation
      case 'Tự truyện - Hồi ký':
        return 'fas fa-pen'; // Icon for Autobiographies
      case 'Quản lý thời gian':
        return 'fas fa-clock'; // Icon for Time Management
      case 'Kinh tế học':
        return 'fas fa-chart-bar'; // Icon for Economics
      case 'Sức khỏe':
        return 'fas fa-heartbeat'; // Icon for Health
      default:
        return 'fas fa-book'; // Default Icon
    }
  };

  return (
    <div className="categories-container">
      <h2>Categories</h2>
      {/* <p>Explore all categories</p> */}
      {error && <p className="error">{error}</p>}
      <div className="category-wrapper">
        {categories.map((category) => (
         <div
         key={category.id}
         className="category-box"
         onClick={() => handleCategoryClick(category.id)} // Gọi hàm khi bấm vào category
       >
            <i className={`${getIconClass(category.name)} category-icon`} aria-hidden="true"></i>
            <p className="category-label">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookApiCategory;
