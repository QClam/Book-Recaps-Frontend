import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CategoryByBookApi.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useParams, useNavigate } from 'react-router-dom';

const CategoryByBookApi = () => {
  const [categories, setCategories] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState(null); // For error handling
  const navigate = useNavigate(); // Khởi tạo navigate
  // Get accessToken and refreshToken from localStorage
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // Function to refresh token
  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://160.25.80.100:7124/api/category', {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${accessToken}`,
          }
        });

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

    const fetchBooks = async () => {
      try {
        const response = await axios.get('https://160.25.80.100:7124/api/book/getallbooks', {
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        const data = response.data;
        if (data && data.succeeded) {
          setAllBooks(data.data.$values);
        }
      } catch (error) {
        // If token is expired, try to refresh it
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchBooks(); // Retry fetching books after refreshing the token
        } else {
          console.log('Error fetching books:', error);
        }
      }
    };

    fetchCategories();
    fetchBooks();
  }, [accessToken, refreshToken]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
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

  // Lọc sách dựa trên danh mục đã chọn
  const filteredBooks = activeCategory === 'All'
    ? allBooks
    : allBooks.filter(book => 
        book.categories.$values.some(cat => cat.name === activeCategory)
      );

   // Hàm điều hướng khi click vào sách
   const handleBookClick = (id) => {
    navigate(`/user-recap-detail/${id}`); // Navigate to UserRecapDetail with the book ID
  };

  return (
    <div className="custom-category-wrapper">
      <div className="custom-category-header">
        <h2 className="custom-title">Categories</h2>
        <p className="custom-subtitle">Explore all categories</p>
        <div className="custom-category-buttons">
          <button
            className={`custom-button ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('All')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`custom-button ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <i className={`${getIconClass(cat.name)} category-button-icon`} aria-hidden="true"></i>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-books-grid">
        {filteredBooks.map((book, index) => (
          <div 
          key={book.id} 
          className="custom-book-card" 
          onClick={() => handleBookClick(book.id)} // Thêm sự kiện onClick
          role="button" // Thêm role để tăng tính truy cập
          tabIndex={0} // Thêm tabIndex để có thể focus
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleBookClick(book.id);
          }} // Thêm sự kiện onKeyPress để hỗ trợ keyboard
        >
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.title} className="custom-book-image" />
            ) : (
              <div className="custom-book-placeholder">No Image</div>
            )}
            <div className="custom-book-details">
              <h3 className="custom-book-title">{book.title}</h3>
              <p className="custom-book-author">
                {book.authors.$values && book.authors.$values.length > 0 ? book.authors.$values[0].name : 'Unknown'}
              </p>
            </div>
          
          </div>
        ))}
      </div>
      {error && <div className="error-message">{error}</div>} {/* Display error message if any */}
    </div>
  );
};

export default CategoryByBookApi;
