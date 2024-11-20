import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import "../AuthorBookApi/AuthorBookApi.scss";

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


const AuthorBookApi = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { author } = location.state || {};
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("https://160.25.80.100:7124/api/book/getallbooks", {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        const allBooks = resolveRefs(response.data.data.$values || []);
        const authorBooks = allBooks.filter(book => 
          book.authors.$values.some(a => a.id === author.id)
        );

        setBooks(authorBooks);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchBooks(); // Retry fetching books after refreshing token
        } else {
          setError(error.message);
        }
      }
    };

    if (author) {
      fetchBooks();
    } else {
      setError("No author data found.");
    }
  }, [author, accessToken]);

  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
    } catch (error) {
      setError("Session expired. Please log in again.");
    }
  };

  // const handleBookClick = (id) => {
  //   navigate(`/user-recap-detail/${id}`); // Navigate to UserRecapDetail with the book ID
  // };

  const handleBookClick = (id) => {
    navigate(`/user-recap-detail-item/${id}`); // Navigate to UserRecapDetail with the book ID
  };


  return (
    <div className="author-books-page">
      <h1>Books by {author ? author.name : 'Unknown Author'}</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="books-grid">
        {books.map(book => (
          <div className="book-cardrd" key={book.id} onClick={() => handleBookClick(book.id)}>
            <img 
  src={book.coverImage || 'https://via.placeholder.com/150'} 
  alt={book.title} 
  onError={({ currentTarget }) => {
    currentTarget.onerror = null; // Ngăn chặn lặp lại lỗi
    currentTarget.src = 'https://via.placeholder.com/150'; // Đặt ảnh mặc định
  }} 
/>

            <h3>{book.title}</h3>
            <p className="book-author"><strong>Author:</strong> {book.authors?.$values?.map(author => author.name).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorBookApi;
