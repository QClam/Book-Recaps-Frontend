import { useEffect, useState } from 'react';
import './CategoryByBookApi.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { generatePath, useNavigate } from 'react-router-dom';
import { axiosInstance } from "../../../utils/axios";
import { resolveRefs } from "../../../utils/resolveRefs";
import { routes } from "../../../routes";

const CategoryByBookApi = () => {
  const [ categories, setCategories ] = useState([]);
  const [ allBooks, setAllBooks ] = useState([]);
  const [ activeCategory, setActiveCategory ] = useState('All');
  const [ error, setError ] = useState(null); // For error handling
  const navigate = useNavigate(); // Khởi tạo navigate

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/category/getallcategory');

        const data = resolveRefs(response.data);
        if (data && data.succeeded) {
          setCategories(data.data.$values);
        } else {
          setCategories([]); // Set empty array if no categories are present
        }
      } catch (error) {
        // If token is expired, try to refresh it
        setError(error.message);
        console.error('Error fetching categories:', error);
      }
    };

    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get('https://bookrecaps.cloud/api/book/getallbooks');

        const data = resolveRefs(response.data);
        if (data && data.succeeded) {
          setAllBooks(data.data.$values);
        }
      } catch (error) {
        console.log('Error fetching books:', error);
      }
    };

    fetchCategories();
    fetchBooks();
  }, []);

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
  //  const handleBookClick = (id) => {
  //   navigate(`/user-recap-detail/${id}`); // Navigate to UserRecapDetail with the book ID
  // };

  const handleBookClick = (id) => {
    navigate(generatePath(routes.bookDetail, { id })); // Navigate to UserRecapDetail with the book ID
  };

  return (
    <div className="custom-category-wrapper">
      <div className="custom-category-header">
        <h2 className="custom-title">Thể loại</h2>
        {/*<p className="custom-subtitle">Explore all categories</p>*/}
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
        {filteredBooks.map((book) => (
          <div
            className="bg-white border border-gray-300 rounded-lg overflow-hidden flex flex-col transition-transform duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg"
            key={book.id}
            onClick={() => handleBookClick(book.id)}
          >
            <div className="block bg-gray-200">
              <img
                src={book.coverImage || "/empty-image.jpg"}
                alt={book.title}
                className="block overflow-hidden shadow-md aspect-[3/4] object-cover w-full bg-gray-50"
              />
            </div>
            <div className="p-5 flex-1 flex flex-col items-start">
              <h2 className="text-lg mb-2 text-gray-800 font-bold line-clamp-2" title={book.title}>
                {book.title}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-1 mb-2" title={book.originalTitle}>
                Tên gốc: <strong>{book.originalTitle}</strong>
              </p>
              {book.authors && book.authors.$values.length > 0 && (
                <p className="text-sm text-gray-600 mb-2"
                   title={book.authors.$values.map((author) => author.name).join(", ")}>
                  Tác giả: <strong>{book.authors.$values.map((author) => author.name).join(", ")}</strong>
                </p>
              )}
              <p className="text-sm text-gray-600 mb-2">
                Năm xuất bản: <strong>{book.publicationYear}</strong>
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
