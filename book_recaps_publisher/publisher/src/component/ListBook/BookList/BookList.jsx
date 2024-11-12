import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../BookList/BookList.scss';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

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

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5; // Number of books per page
  const maxPageButtons = 5;
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
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
          fetchBooks();
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

  // Calculate total pages
  const totalPages = Math.ceil(books.length / booksPerPage);

      // Filter books based on search term
      const filteredBooks = books.filter(book =>
        (book.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (book.authors?.$values?.some(author => author.name?.toLowerCase().includes(searchTerm.toLowerCase())) || false) ||
        (book.categories?.$values?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (book.publicationYear?.toString().includes(searchTerm) || false) ||
        (book.status?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      );
      
      
  // Get the books for the current page
  const currentBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  // Determine the start and end of the page number range
  const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "negotiation":
        return "blue";
      case "approval":
        return "green";
      case "disapproval":
        return "red";
      default:
        return "gray";
    }
  };

  const handleAddBook = () => {
    navigate('/addbook');
  };

  return (
    <div className="list-book-container-container">
    <div className="header">
      <h3>List of Books</h3>
      <div className="search-bar-container">
      <button className="add-new-book-btn" onClick={handleAddBook}>
            Add New Book
          </button>

          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
        </div>

      </div>
      <table className="book-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Approval</th>
            <th>Genre</th>
            <th>Title</th>
            <th>Author</th>
            <th>PublicationYear</th>
            {/* <th>Status</th> 
            <th>Guidelines</th> */}
          </tr>
        </thead>
        <tbody>
        {currentBooks.map((book, index) => (
            <tr key={index}>
              <td>{(currentPage - 1) * booksPerPage + index + 1}</td>

      <td><input type="checkbox" /></td>
      <td>
        <span className={`tag ${book.categories?.$values[0]?.name?.toLowerCase() || 'unknown'}`}>
          {book.categories?.$values[0]?.name || 'Unknown'}
        </span>
      </td>
      <td>{book.title || 'No Title'}</td>
      <td>
        {book.authors?.$values.map(author => author.name).join(', ') || 'Unknown Author'}
      </td>
      <td>{book.publicationYear || 'N/A'}</td> {/* Display publication year */}
      {/* <td>
                <span style={{ color: getStatusColor(book.status) }}>
                  {book.status || 'Unknown Status'}
                </span>
              </td> */}

      {/* <td>
        <a href="#" className="guidelines-link">View Guidelines</a>
      </td> */}
    </tr>
  ))}
</tbody>

      </table>
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(1)} 
          disabled={currentPage === 1}
        >«</button>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >‹</button>

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? "active" : ""}
          >
            {page}
          </button>
        ))}

        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >›</button>
        <button 
          onClick={() => handlePageChange(totalPages)} 
          disabled={currentPage === totalPages}
        >»</button>

<span>Showing {((currentPage - 1) * booksPerPage) + 1} to {Math.min(currentPage * booksPerPage, filteredBooks.length)} of {filteredBooks.length} entries</span>

      </div>

      <div className="submit-approve-container">
        {/* <button className="submit-approve-btn">Submit Approve</button> */}
      </div>
    </div>
  );
};

export default BookList;
