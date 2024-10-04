// BookApi.jsx
import React, { useEffect, useState } from 'react';
import './BookApi.scss';
import { useNavigate } from 'react-router-dom';
const BookApi = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const fetchBooks = async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxY2E2Mjk0ZS1kNWVmLTQ4ODAtOGRjOC1iNDBmMDUwZDRhZDQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTI1LjIzNS4yMzguMTgxIiwiaW1hZ2VfdXJsIjoiRmlsZXMvSW1hZ2UvanBnL2FkLmpwZyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNvbnRyaWJ1dG9yIiwiZXhwIjoxNzI4MDM5ODg3LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTI0IiwiYXVkIjoiYm9va3JlY2FwIn0.vnmFAY3CqSbrWkSb-H0RlJx13TzGTreftlKHl_xk13Y';
    try {
      const response = await fetch('https://160.25.80.100:7124/api/book', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      // Kiểm tra phản hồi từ server
      if (!response.ok) {
        const errorDetails = await response.text(); // Lấy thêm thông tin từ phản hồi
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
      }

      const data = await response.json();
      setBooks(data.data.$values); // Truy cập vào danh sách sách
    } catch (error) {
      console.error('Error fetching data:', error); // Ghi lại lỗi
      setError(error.message); // Cập nhật lỗi để hiển thị
    } finally {
      setLoading(false); // Đánh dấu là đã hoàn tất việc fetch
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSeeMore = () => {
    navigate('/book-api-detail');
  };
  return (
    <div className="book-api">
      {loading && <p>Loading...</p>}
      {/* {error && <p>Error: {error}</p>} */}
      <ul className="book-list">
        {books.slice(0, 16).map(book => (
          <li key={book.id} className="book-item">
            <h2>{book.title}</h2>
            <h3>{book.originalTitle}</h3>
            <p>{book.description}</p>
            <p><strong>Publication Year:</strong> {book.publicationYear}</p>
            {book.coverImage && <img src={book.coverImage} alt={book.title} className="book-cover" />}
          </li>
        ))}
      </ul>
      {books.length > 16 && (
        <div className="see-more">
          <button onClick={handleSeeMore}>See more</button>
        </div>
      )}
    </div>
  );
};

export default BookApi;
