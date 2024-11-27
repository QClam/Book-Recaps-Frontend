import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "../Dashboard/DashboardDetail.scss";

const DashboardDetail = () => {
  const { bookId } = useParams(); // Lấy bookId từ URL
  const [book, setBook] = useState(null);
  const accessToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const response = await fetch(`https://160.25.80.100:7124/api/book/getbookbyid/${bookId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setBook(data?.data); // Lưu dữ liệu sách
      } catch (error) {
        console.error('Failed to fetch book detail:', error);
      }
    };

    fetchBookDetail();
  }, [bookId, accessToken]);

  if (!book) return <div>Loading...</div>; // Hiển thị khi đang tải dữ liệu

  return (
    <div className="book-detail">
      <h1>{book.title}</h1>
      <img src={book.coverImage} alt={book.title} />
      <p><strong>Mô tả:</strong> {book.description}</p>
      <p><strong>Năm xuất bản:</strong> {book.publicationYear}</p>
      <p><strong>Nhà xuất bản:</strong> {book.publisher.publisherName}</p>
      <p><strong>Tác giả:</strong> {book.authors.$values.map((author) => author.name).join(', ')}</p>
      <p><strong>Thể loại:</strong> {book.categories.$values.map((category) => category.name).join(', ')}</p>

      {/* Hiển thị số lượng và tên các recap */}
      <div className="recaps">
        <p><strong>Số lượng recap:</strong> {book.recaps.$values.length}</p>
        <p><strong>Tên recap:</strong> {book.recaps.$values.map((recap) => recap.name).join(', ')}</p>
      </div>
    </div>
  );
};

export default DashboardDetail;
