import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Studio/BookInfo.scss';
//khi ma nhap thong tin sach khong ra thi se co 1 cai form de contributor nhap thong tin sach
const BookInfo = () => {
  const [originalTitle, setOriginalTitle] = useState('');
  const [vietnameseTitle, setVietnameseTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [categories, setCategories] = useState([]);
  const [ageLimit, setAgeLimit] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [estimatedReadingTime, setEstimatedReadingTime] = useState('');

  const navigate = useNavigate(); // Initialize the navigate hook

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    // After form submission, navigate to the Content page
    navigate('/content');
  };

  return (
    <div className="book-info-container">
      <h2>Nhập thông tin sách</h2>
      <form onSubmit={handleFormSubmit}>
        <label>
          Tên sách gốc:
          <input
            type="text"
            value={originalTitle}
            onChange={(e) => setOriginalTitle(e.target.value)}
          />
        </label>
        <label>
          Tên tiếng Việt (Tạm dịch/Tiêu đề chính thức):
          <input
            type="text"
            value={vietnameseTitle}
            onChange={(e) => setVietnameseTitle(e.target.value)}
            placeholder="Không cần điền nếu tên sách là tiếng Việt"
          />
        </label>
        <label>
          Tác giả:
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nhập tên tác giả"
          />
        </label>
        <label>
          Năm xuất bản:
          <input
            type="number"
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
          />
        </label>
        <label>
          Thể loại:
          <select
            multiple
            value={categories}
            onChange={(e) =>
              setCategories(Array.from(e.target.selectedOptions, option => option.value))
            }
          >
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Science">Science</option>
            <option value="Biography">Biography</option>
            {/* Các category có sẵn của hệ thống */}
          </select>
        </label>
        <label>
          Giới hạn tuổi (tùy chọn):
          <input
            type="number"
            value={ageLimit}
            onChange={(e) => setAgeLimit(e.target.value)}
          />
        </label>
        <label>
          Hình ảnh quyển sách:
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </label>
        <label>
          Mô tả:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Thời lượng đọc dự kiến:
          <input
            type="text"
            value={estimatedReadingTime}
            onChange={(e) => setEstimatedReadingTime(e.target.value)}
          />
        </label>
        <button type="submit">Lưu thông tin</button>
      </form>
    </div>
  );
};

export default BookInfo;
