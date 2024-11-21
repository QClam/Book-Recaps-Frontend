import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BookTable.scss';

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

const BookTable = ({ booksToShow }) => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('https://160.25.80.100:7124/api/book/getallbooks', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        const bookData = resolveRefs(response.data?.data?.$values || []);
        setBooks(bookData);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchBooks(); // Retry after refreshing token
        } else {
          setError(error.message);
          console.error("Error fetching books:", error);
        }
      }
    };

    const handleTokenRefresh = async () => {
      try {
        const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
          refreshToken,
        });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;
        localStorage.setItem("authToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        console.log("Token refreshed successfully");
      } catch (error) {
        console.error("Error refreshing token:", error);
        setError("Session expired. Please log in again.");
      }
    };

    fetchBooks();
  }, [accessToken, refreshToken]);

  // Chọn số lượng sách hiển thị dựa trên booksToShow
  const displayedBooks = booksToShow === "All" ? books : books.slice(0, booksToShow);

  return (
    <div className="book-table">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Publication Year</th>
            <th>Number of Summaries</th>
            <th>Total Earnings</th>
          </tr>
        </thead>
        <tbody>
          {displayedBooks.map((book) => (
            <tr key={book.id}>
              <td>
                <img 
                  src={book.coverImage || "/empty-image.jpg"} 
                  alt="Book Cover" 
                  className="" 
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null;
                    // currentTarget.src = "/empty-image.jpg";
                  }} 
                />
              </td>
              <td>{book.title}</td>
              <td>{book.publicationYear}</td>
              <td>{book.recaps?.$values ? book.recaps.$values.length : 0}</td>
              <td>{book.bookEarnings?.$values.reduce((acc, earning) => acc + (earning.amount || 0), 0)} VND</td>
            </tr>
          ))}
        </tbody>
      </table>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default BookTable;
