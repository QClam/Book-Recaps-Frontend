import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../BookList/BookList.scss';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import emptyImage from "../../../assets/empty-image.png"
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
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [userId, setUserId] = useState(null);

const toggleMenu = (index) => {
  setOpenMenuIndex(openMenuIndex === index ? null : index);
};


const handleDelete = (book) => {
  setBookToDelete(book); // Lưu thông tin cuốn sách cần xóa
  setShowPopup(true);    // Hiển thị popup
};

const confirmDelete = async () => {
  if (bookToDelete) {
    try {
      await axios.delete(`https://bookrecaps.cloud/api/book/deletebook/${bookToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      setBooks(books.filter((b) => b.id !== bookToDelete.id)); // Cập nhật danh sách sách
      setShowPopup(false); // Đóng popup
      setBookToDelete(null); // Xóa thông tin cuốn sách đã chọn
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  }
};

const cancelDelete = () => {
  setShowPopup(false); // Đóng popup
  setBookToDelete(null); // Xóa thông tin cuốn sách đã chọn
};

useEffect(() => {
  const fetchUserId = async () => {
    try {
      const profileResponse = await axios.get(
        "https://bookrecaps.cloud/api/personal/profile",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUserId(profileResponse.data.id);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Unable to fetch user profile.");
    }
  };

  fetchUserId();
}, [accessToken]);



  useEffect(() => {
    if (!userId) return;

    const fetchBooks = async () => {
      try {
        const booksResponse = await axios.get(
          "https://bookrecaps.cloud/api/book/getallbooks",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const resolvedBooks = resolveRefs(booksResponse.data?.data?.$values || []);
        const userBooks = resolvedBooks.filter(
          (book) => book.publisher?.userId === userId
        );

        setBooks(userBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
        setError("Unable to fetch books.");
      }
    };

    fetchBooks();
  }, [userId, accessToken, refreshToken]);

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


  const handleAddBook = () => {
    navigate('/addbook');
  };

  const handleUpdate = (book) => {
    navigate(`/updatebook/${book.id}`);
  };

  const handleNavigate = (contractId) => {
    navigate(`/contract-detail/${contractId}`);
  };

  const handleBookInfoClick = (id) => {
    navigate(`/book-detail/${id}`); // Điều hướng đến trang chi tiết với `id` của sách
  };

  
  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return "Bản nháp";
      case 1: return "Đang xử lý";
      case 2: return "Chưa bắt đầu";
      case 3: return "Đang kích hoạt";
      case 4: return "Hết hạn";
      case 5: return "Từ chối";
      default: return "Không xác định";
    }
  };
  
  return (
    <div className="list-book-container-container">
    <div className="header">
      <h3>Danh sách sách</h3>
      <div className="search-bar-container">
      {/* <button className="add-new-book-btn" onClick={handleAddBook}>
            Thêm mới sách
          </button> */}

          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm sách "
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
            <th>Ảnh bìa</th>
            <th>Thể loại</th>
            <th>Tiêu đề</th>
            <th>Tác giả</th>
            <th>Năm xuất bản</th>
            <th>Hợp đồng</th>
            {/* <th>Thao tác</th>*/}
          </tr>
        </thead>
        <tbody>
        {currentBooks.map((book, index) => (
             <tr key={index} onDoubleClick={() => handleBookInfoClick(book.id)} style={{ cursor: 'pointer' }}>

              <td>{(currentPage - 1) * booksPerPage + index + 1}</td>
              <td> <img src={book.coverImage ? book.coverImage : emptyImage} width="50" height="95" /></td>
      
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
     
      <td>
    {book.publisher?.contracts?.$values?.length > 0
    ? book.publisher.contracts.$values.map(contract => (
        <div key={contract.id} className="contract-item">
          <span
        className="contract-id"
        onClick={() => handleNavigate(contract.id)}
        style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
      >
        ID: {contract.id}
      </span>
          <span className="contract-status">Status: {getStatusLabel(contract.status)}</span>
        </div>
      ))
    : "Không có hợp đồng"}
</td>


      {/* <td>
        <div className="action-menu">
          <button 
            className="action-button"
            onClick={() => toggleMenu(index)}
          >
            ⋮
          </button>
          {openMenuIndex === index && (
            <div className="dropdown-menu">
              <button onClick={() => handleUpdate(book)}>Update</button>

              <button onClick={() => handleDelete(book)}>Delete</button>
            </div>
          )}

              {showPopup && bookToDelete && (
                <div className="popup-overlay">
                  <div className="popup-content">
                    <p>Are you sure you want to delete this book: <strong>{bookToDelete.title}</strong>?</p>
                    <button onClick={confirmDelete} className="confirm-button">Yes</button>
                    <button onClick={cancelDelete} className="cancel-button">No</button>
                  </div>
                </div>
              )}
        </div>
      </td>     */}
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
    </div>
  );
};

export default BookList;