import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CategoryByBookApi.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';

const CategoryByBookApi = () => {
  const [categories, setCategories] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  // Đặt token một lần để sử dụng cho cả hai cuộc gọi API
  const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NWRmM2ExZC04NWY5LTQ2MzMtYTAwZC01ZTg0MjFiZWI3ZTQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTE2LjExMC40MS45MCIsImltYWdlX3VybCI6IkZpbGVzL0ltYWdlL2pwZy9hZC5qcGciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb250cmlidXRvciIsImV4cCI6MTcyODIyODA3NiwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzEyNCIsImF1ZCI6ImJvb2tyZWNhcCJ9.S6zTH1h6IdHOHndAtLhY7B_rVcnSBb1-Elqii75QX4Q';

  useEffect(() => {
    // Fetch categories từ API
    axios
      .get('https://160.25.80.100:7124/api/category', {
        headers: {
          'accept': '*/*',
          'Authorization': token,
        }
      })
      .then((res) => {
        if (res.data && res.data.succeeded) {
          setCategories(res.data.data.$values);
        }
      })
      .catch((err) => console.log('Error fetching categories:', err));
  }, [token]);

  useEffect(() => {
    // Fetch tất cả sách từ API
    const fetchBooks = async () => {
      try {
        const response = await axios.get('https://160.25.80.100:7124/api/book/getallbooks', {
          headers: {
            'accept': '*/*',
            'Authorization': token,
          }
        });

        if (response.data && response.data.succeeded) {
          setAllBooks(response.data.data.$values);
        }
      } catch (error) {
        console.log('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [token]);

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
          <div key={index} className="custom-book-card">
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
            <div className="custom-book-rating">
              <span className="custom-heart">❤️</span>
              <span className="custom-rating-number">{book.rating}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryByBookApi;
