import { useEffect, useState } from 'react';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';
import "../AuthorBookApi/AuthorBookApi.scss";
import { axiosInstance } from "../../../../utils/axios";
import { resolveRefs } from "../../../../utils/resolveRefs";
import { routes } from "../../../../routes";

const AuthorBookApi = () => {
  const [ books, setBooks ] = useState([]);
  const [ error, setError ] = useState(null);
  const location = useLocation();
  const { author } = location.state || {};
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get("/api/book/getallbooks");

        const allBooks = resolveRefs(response.data.data.$values || []);
        const authorBooks = allBooks.filter(book =>
          book.authors.$values.some(a => a.id === author.id)
        );

        setBooks(authorBooks);
      } catch (error) {
        setError(error.message);
      }
    };

    if (author) {
      fetchBooks();
    } else {
      setError("No author data found.");
    }
  }, [ author ]);

  // const handleBookClick = (id) => {
  //   navigate(`/user-recap-detail/${id}`); // Navigate to UserRecapDetail with the book ID
  // };

  const handleBookClick = (id) => {
    navigate(generatePath(routes.bookDetail, { id })); // Navigate to UserRecapDetail with the book ID
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
            />
            <h3>{book.title}</h3>
            <p className="book-author">
              <strong>Author:</strong> {book.authors?.$values?.map(author => author.name).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorBookApi;
