import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ReactPaginate from "react-paginate";
import axios from "axios";
import "./BookApi.scss"; // Import CSS cho styling
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

const BookApi = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState(null); // For error handling
  const booksPerPage = 16; // Số lượng sách mỗi trang
  const navigate = useNavigate();
  // Trạng thái cho Search
  const [searchTitle, setSearchTitle] = useState("");
  const [searchAuthor, setSearchAuthor] = useState("");

  // Trạng thái cho Filter
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ageLimits, setAgeLimits] = useState([]);
  const [selectedAgeLimit, setSelectedAgeLimit] = useState("");
  const [publicationYears, setPublicationYears] = useState([]);
  const [selectedPublicationYear, setSelectedPublicationYear] = useState("");

  // State for publisher filter
  const [publishers, setPublishers] = useState([]);
  const [selectedPublisher, setSelectedPublisher] = useState("");

  // Lấy accessToken và refreshToken từ localStorage
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Fetch books data from the API
        const response = await axios.get(
          "https://bookrecaps.cloud/api/book/getallbooks",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = resolveRefs(response.data);
        console.log("Fetched Books Data:", data); // Kiểm tra dữ liệu
        

        if (data && data.data && Array.isArray(data.data.$values)) {
          setBooks(data.data.$values); // Giả sử dữ liệu sách nằm trong `data.$values`
          setFilteredBooks(data.data.$values);
          extractFilters(data.data.$values);
        } else {
          setBooks([]);
          setFilteredBooks([]);
        }
      } catch (error) {
        // Nếu token hết hạn, thử làm mới nó
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchBooks(); // Thử lại việc lấy sách sau khi làm mới token
        } else {
          setError(error.message);
          console.error("Error fetching books:", error);
        }
      }
    };

    fetchBooks();
  }, [accessToken]);

  // Hàm làm mới token
  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post(
        "https://bookrecaps.cloud/api/tokens/refresh",
        {
          refreshToken,
        }
      );

      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = response.data.message.token;

      // Cập nhật localStorage với token mới
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Session expired. Please log in again.");
    }
  };

  // Hàm để trích xuất các giá trị lọc từ dữ liệu sách
  const extractFilters = (booksData) => {
    const categorySet = new Set();
    const ageLimitSet = new Set();
    const publicationYearSet = new Set();
    const publisherSet = new Set();

    booksData.forEach((book) => {
      // Categories
      if (book.categories && book.categories.$values) {
        book.categories.$values.forEach((cat) => categorySet.add(cat.name));
      }

      // Age Limits
      ageLimitSet.add(book.ageLimit);

      // Publication Years
      publicationYearSet.add(book.publicationYear);

      if (book.publisher && book.publisher.publisherName) {
        publisherSet.add(book.publisher.publisherName);
      }

    });

    setCategories([...categorySet]);
    setAgeLimits([...ageLimitSet].sort((a, b) => a - b));
    setPublicationYears([...publicationYearSet].sort((a, b) => b - a));
    setPublishers([...publisherSet]);

  };

  // Hàm xử lý khi thay đổi Search hoặc Filter
  useEffect(() => {
    let tempBooks = [...books];

    // Apply Search by title
    if (searchTitle) {
      tempBooks = tempBooks.filter((book) =>
        book.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    // Apply Search by author
    if (searchAuthor) {
      const lowerSearchAuthor = searchAuthor.toLowerCase();
      tempBooks = tempBooks.filter((book) =>
        book.authors &&
        book.authors.$values &&
        book.authors.$values.some(
          (author) =>
            author.name &&
            author.name.toLowerCase().includes(lowerSearchAuthor)
        )
      );
    }

    // Apply Filter (Categories, Age Limit, Publication Year)
    if (selectedCategories.length > 0) {
      tempBooks = tempBooks.filter((book) =>
        book.categories &&
        book.categories.$values &&
        book.categories.$values.some((cat) =>
          selectedCategories.includes(cat.name)
        )
      );
    }

    if (selectedAgeLimit !== "") {
      tempBooks = tempBooks.filter(
        (book) => book.ageLimit === Number(selectedAgeLimit)
      );
    }

    if (selectedPublicationYear !== "") {
      tempBooks = tempBooks.filter(
        (book) => book.publicationYear === Number(selectedPublicationYear)
      );
    }

    // Apply publisher filter
    if (selectedPublisher) {
      tempBooks = tempBooks.filter((book) =>
        book.publisher?.publisherName === selectedPublisher
      );
    }

    setFilteredBooks(tempBooks);
    setCurrentPage(0); // Reset về trang đầu khi có thay đổi
  }, [
    books,
    searchTitle,
    searchAuthor,
    selectedCategories,
    selectedAgeLimit,
    selectedPublicationYear,
    selectedPublisher,

  ]);

  // Tính toán phân trang
  const pageCount =
    filteredBooks.length > 0 ? Math.ceil(filteredBooks.length / booksPerPage) : 1;
  const offset = currentPage * booksPerPage;
  const currentBooks = filteredBooks.slice(offset, offset + booksPerPage);

  // Xử lý khi thay đổi trang
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Xử lý thay đổi các bộ lọc
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedCategories([...selectedCategories, value]);
    } else {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== value));
    }
  };

  const handleAgeLimitChange = (e) => {
    setSelectedAgeLimit(e.target.value);
  };

  const handlePublicationYearChange = (e) => {
    setSelectedPublicationYear(e.target.value);
  };

  const handlePublisherChange = (e) => {
    setSelectedPublisher(e.target.value);
  };


  // const handleBookClick = (id) => {
  //   navigate(`/bookdetailbook/${id}`); // Use the book's id for navigation
  // };
  const handleBookClick = (id) => {
    navigate(`/user-recap-detail-item/${id}`); // Navigate to UserRecapDetail with the book ID
  };

  return (
    <div className="book-api-container">
      {/* <h1 className="title">Danh Sách Sách</h1> */}

      {error && <p className="error">Lỗi: {error}</p>}

      {/* Phần Search và Filter */}
      <div className="filters-container">
        <div className="search-section">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="search-input"
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tác giả..."
            value={searchAuthor}
            onChange={(e) => setSearchAuthor(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <h3>Thể loại</h3>
            {categories.map((category) => (
              <label key={category} className="filter-label">
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={handleCategoryChange}
                />
                {category}
              </label>
            ))}
          </div>

          <div className="filter-groupup">
            <h3>Nhà xuất bản</h3>
            <select value={selectedPublisher} onChange={handlePublisherChange} className="filter-select">
              <option value="">Tất cả</option>
              {publishers.map((publisher) => (
                <option key={publisher} value={publisher}>{publisher}</option>
              ))}
            </select>
          </div>

          <div className="filter-groupup">
            <h3>Giới hạn tuổi</h3>
            <select
              value={selectedAgeLimit}
              onChange={handleAgeLimitChange}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              {ageLimits.map((age) => (
                <option key={age} value={age}>
                  {age === 0 ? "Không giới hạn" : age}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-groupup">
            <h3>Năm xuất bản</h3>
            <select
              value={selectedPublicationYear}
              onChange={handlePublicationYearChange}
              className="filter-select"
            >
              <option value="">Tất cả</option>
              {publicationYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách sách */}
      <div className="book-list-stst">
        {currentBooks.length > 0 ? (
          currentBooks.map((book) => (
            <div className="book-item-emem" key={book.id} onClick={() => handleBookClick(book.id)}>
              {book.coverImage && (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="book-cover"
                />
              )}
              <div className="book-info">
                <h2 className="book-title">{book.title}</h2>
                {/* <h3 className="book-original-title">{book.originalTitle.length > 18 ? `${book.originalTitle.slice(0, 10)}\n${book.originalTitle.slice(25)}` : book.originalTitle}</h3> */}
                <p className="book-publication-year">
                  <strong>Năm xuất bản:</strong> {book.publicationYear}
                </p>
                {book.authors && book.authors.$values.length > 0 && (
                  <p className="book-author">
                    <strong>Tác giả:</strong>{" "}
                    {book.authors.$values
                      .map((author) => author.name)
                      .filter(Boolean) // Loại bỏ các tên undefined/null
                      .join(", ")}
                  </p>
                )}
                {/* <p className="book-description">{book.description}</p> */}
              </div>
            </div>
          ))
        ) : (
          <p>Không tìm thấy sách nào.</p>
        )}
      </div>

      {/* Phân trang */}
      {filteredBooks.length > 0 && (
        <ReactPaginate
          previousLabel={"Trước"}
          nextLabel={"Sau"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination"}
          activeClassName={"active"}
        />
      )}
    </div>
  );
};

export default BookApi;
