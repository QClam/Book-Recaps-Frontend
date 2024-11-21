import React, { useState, useEffect } from 'react'
import api from '../Auth/AxiosInterceptors'
import Pagination from "@mui/material/Pagination";
import { Add, MoreHoriz, Visibility } from "@mui/icons-material";
import Modal from "react-modal";
import empty_image from "../../data/empty-image.png"
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function BookList() {

  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal visibility state
  const [error, setError] = useState(null); // Error state
  const [addBookForm, setAddBookForm] = useState({
    Title: "",
    OriginalTitle: "",
    Description: "",
    PublicationYear: "",
    CoverImage: "",
    AgeLimit: "",
    AuthorId: "",
    AuthorName: "",
    AuthorImage: "",
    AuthorDescription: "",
    PublisherId: "",
    CategoryIds: [],
    coverImage: "",
    authorImage: "",
  });

  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    // Validate that Title, OriginalTitle, and Description start with an uppercase letter
    const stringFields = ['Title', 'OriginalTitle', 'Description', 'AuthorName', 'AuthorDescription'];
    stringFields.forEach(field => {
      if (!/^[A-Z]/.test(addBookForm[field])) {
        errors[field] = `${field} nên bắt đầu bằng chữ in hoa.`;
      }
    });

    // Validate that PublicationYear and AgeLimit are numbers
    const currentYear = new Date().getFullYear();
    if (!/^\d+$/.test(addBookForm.PublicationYear) ||
      addBookForm.PublicationYear < 1000 ||
      addBookForm.PublicationYear > currentYear) {
      errors.PublicationYear = `Publication Year là năm hợp lệ từ 1000 đến ${currentYear}.`;
    }

    if (!/^\d+$/.test(addBookForm.AgeLimit)) {
      errors.AgeLimit = 'Age Limit là chữ số.';
    }

    return errors;
  };

  const booksPerPage = 5;

  const fetchBooks = async () => {
    const response = await api.get('/api/book/getallbooks')
    const books = response.data.data.$values;
    console.log("Books: ", books);
    setBooks(books);
  }

  useEffect(() => {
    fetchBooks();
  }, [])

  useEffect(() => {
    if (currentPage > Math.ceil(books.length / booksPerPage)) {
      setCurrentPage(1);
    }
  }, [books.length, currentPage]);

  const displayBooks = books.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const detailBook = async (id) => {
    navigate(`/book/${id}`)
  }

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <div className='userlist-container'>
      <h2>Danh sách những cuốn sách</h2>
      <div className="header">
        <div className="add-button">
          <button className="button">
            <Add style={{ marginRight: 8 }} />
            Thêm cuốn sách
          </button>
        </div>
      </div>

      <div>
        <table className="content-table">
          <thead>
            <tr>
              <th></th>
              <th>Tên Sách</th>
              <th>Tên Gốc</th>
              <th>Mô tả</th>
              <th>Xuất bản</th>
              <th>Tác giả</th>
              <th>Độ tuổi</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayBooks.map((book) => (
              <tr key={book.id}>
                <td><img
                  src={book.coverImage || empty_image}
                  alt="Book Cover"
                  style={{ width: 60, height: 60 }}
                  onError={(e) => {
                    e.currentTarget.onerror = null; // Đảm bảo không lặp lại sự kiện
                    e.currentTarget.src = empty_image; // Đặt lại ảnh nếu lỗi
                  }}
                /></td>
                <td>{book.title}</td>
                <td>{book.originalTitle}</td>
                <td>{book.description.length > 100 ? `${book.description.substring(0, 100)}...` : book.description}</td>
                <td>{book.publicationYear}</td>
                <td> {book.authors.$values ? book.authors.$values.map(author => author.name).join(", ") : "N/A"}</td>
                <td>{book.ageLimit}</td>
                <td><Button onClick={() => detailBook(book.id)}><Visibility /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        className="center"
        count={Math.ceil(books.length / booksPerPage)} // Total number of pages
        page={currentPage} // Current page
        onChange={handlePageChange} // Handle page change
        color="primary" // Styling options
        showFirstButton
        showLastButton
      />
    </div>
  )
}

export default BookList