import React, { useEffect, useState } from 'react'; 
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "../BookList/BookListDetail.scss";

const BookListDetail = () => {
  const { id } = useParams(); // Lấy `id` từ URL
  const [bookDetail, setBookDetail] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const response = await axios.get(`https://bookrecaps.cloud/api/book/getbookbyid/${id}`);
        const resolvedData = resolveRefs(response.data); // Giải quyết các tham chiếu `$ref`
        setBookDetail(resolvedData.data); // Lưu thông tin chi tiết sách
      } catch (err) {
        setError("Không thể tải thông tin sách.");
      }
    };

    fetchBookDetail();
  }, [id]);

  return (
    <div className="book-detail-dt">
      {error && <p className="error-message">{error}</p>}
      {bookDetail ? (
        <>
          <div className="book-image">
            <img src={bookDetail.coverImage} alt={bookDetail.title} />
          </div>
          <h1>{bookDetail.title}</h1>
          <p><strong>Tên gốc:</strong> {bookDetail.originalTitle}</p>
          <p><strong>Mô tả:</strong> {bookDetail.description}</p>
          <p><strong>Năm xuất bản:</strong> {bookDetail.publicationYear}</p>
          <p><strong>Nhà xuất bản:</strong> {bookDetail.publisher?.publisherName}</p>
          <p><strong>Liên hệ nhà xuất bản:</strong> {bookDetail.publisher?.contactInfo}</p>
          <p><strong>ISBN-13:</strong> {bookDetail.isbN_13 || "Chưa có"}</p>
          <p><strong>ISBN-10:</strong> {bookDetail.isbN_10 || "Chưa có"}</p>
          <p><strong>Giới hạn độ tuổi:</strong> {bookDetail.ageLimit}</p>
          <p><strong>Tác giả:</strong>  
                {bookDetail.authors?.$values?.map(author => (
                <span key={author.id} className="author-name">{author.name}</span>
                ))}</p>    
          <p><strong>Thể loại:</strong>
               {bookDetail.categories?.$values?.map(category => (
                <span key={category.id} className="category-name">{category.name}</span>
                ))}</p>      
        </>
      ) : (
        <p>Đang tải...</p>
      )}
    </div>
  );
};

// Giải quyết các tham chiếu `$ref` trong dữ liệu
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

export default BookListDetail;
