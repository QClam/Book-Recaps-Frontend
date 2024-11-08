import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './BookListCategory.scss'; // Import file SCSS mới

// Function to resolve $ref references in data
const resolveRefs = (data) => {
  const refMap = new Map();
  
  const createRefMap = (obj) => {
    if (typeof obj !== "object" || obj === null) return;
    if (obj.$id) {
      refMap.set(obj.$id, obj);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        createRefMap(obj[key]);
      }
    }
  };

  const resolveRef = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    if (obj.$ref) {
      return refMap.get(obj.$ref);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = resolveRef(obj[key]);
      }
    }
    return obj;
  };

  createRefMap(data);
  return resolveRef(data);
};


const BookListCategory = () => {
  const { categoryId } = useParams(); // Lấy categoryId từ URL
  const [books, setBooks] = useState([]); // Đặt giá trị khởi tạo là một mảng
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState(''); // Để hiển thị tên category
  const navigate = useNavigate(); // Khởi tạo navigate

  // Lấy accessToken và refreshToken từ localStorage
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `https://160.25.80.100:7124/api/book/getallbooks?categoryId=${categoryId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`, // Sử dụng access token
              'accept': '*/*',
            },
          }
        );

        console.log('Response Data:', response.data); // Debugging: Kiểm tra dữ liệu phản hồi

        // Kiểm tra xem dữ liệu trả về có đúng định dạng không
        if (response.data && response.data.data && Array.isArray(response.data.data.$values)) {
          // Resolve references in data
          const resolvedData = resolveRefs(response.data.data);

          const filteredBooks = resolvedData.$values.filter(book =>
            book.categories &&
            book.categories.$values &&
            book.categories.$values.some(category => category.id === categoryId)
          );


          setBooks(filteredBooks); // Đặt mảng sách đã lọc vào state

          // Lấy tên category từ danh sách categories (nếu cần)
          if (filteredBooks.length > 0) {
            const firstBook = filteredBooks[0];
            const category = firstBook.categories.$values.find(cat => cat.id === categoryId);
            if (category) {
              setCategoryName(category.name);
            }
          }
        } else {
          console.error('Dữ liệu trả về không đúng định dạng:', response.data);
          setBooks([]); // Thiết lập mảng rỗng nếu không phải
        }
      } catch (error) {
        // Nếu token hết hạn, thử làm mới nó
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchBooks(); // Retry fetching books after refreshing the token
        } else {
          setError(error.message);
          console.error('Error fetching books:', error);
        }
      }
    };

    fetchBooks();
  }, [categoryId, accessToken, refreshToken]); // Cập nhật accessToken và refreshToken trong dependency array

  // Hàm làm mới token
  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      // Cập nhật localStorage với token mới
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Session expired. Please log in again.");
    }
  };

  // Hàm điều hướng khi click vào sách
  // const handleBookClick = (id) => {
  //   navigate(`/bookdetailbook/${id}`); // Sử dụng id của sách để điều hướng
  // };

  const handleBookClick = (id) => {
    navigate(`/user-recap-detail/${id}`); // Navigate to UserRecapDetail with the book ID
  };
  //chạy qua class BookDetailBook qua tiep RecapDetail

  return (
    <div className="book-list-container">
      <h2>{categoryName || 'Loading...'}</h2>
      {error && <p className="error">{error}</p>}
      <div className="books-container"> {/* Thêm lớp books-container */}
        {/* Bảo vệ chống lỗi */}
        {Array.isArray(books) && books.length > 0 ? (
          books.map((book) => (
            <div 
              key={book.id} 
              className="book-item" 
              onClick={() => handleBookClick(book.id)} // Thêm sự kiện onClick
              role="button" // Thêm role để tăng tính truy cập
              tabIndex={0} // Thêm tabIndex để có thể focus
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleBookClick(book.id);
              }} // Thêm sự kiện onKeyPress để hỗ trợ keyboard
            >
              <img src={book.coverImage} alt={book.title} className="book-cover" />
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author"><strong>Author:</strong> {book.authors?.$values?.map(author => author.name).join(', ')}</p>
              {/* Bạn có thể thêm các thông tin khác nếu cần */}
            </div>
          ))
        ) : (
          <p>No books found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default BookListCategory;
