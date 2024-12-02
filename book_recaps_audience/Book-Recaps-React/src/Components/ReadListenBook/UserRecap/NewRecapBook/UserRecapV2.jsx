import { useEffect, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
//import "../UserRecap/UserRecap.scss";  // Đổi tên SCSS file
import "../NewRecapBook/UserRecapV2.scss";
import { axiosInstance } from "../../../../utils/axios";
import { resolveRefs } from "../../../../utils/resolveRefs";
import { routes } from "../../../../routes";

const UserRecapV2 = () => {
  const [ books, setBooks ] = useState([]);
  const [ error, setError ] = useState(null);
  const [ showAll, setShowAll ] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get('/api/book/getallbooks');
        const data = resolveRefs(response.data);
        if (data && data.succeeded && Array.isArray(data.data.$values)) {
          setBooks(data.data.$values);
        } else {
          console.error('Data is not an array:', data);
          setBooks([]);
        }
      } catch (error) {
        setError(error.message);
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  const handleBookClick = (book) => {
    navigate(generatePath(routes.bookDetail, { id: book.id })); // Navigate to UserRecapDetail with the book ID
  };

  const displayedBooks = showAll ? books : books.slice(0, 12); // Show first 8 books by default

  const truncateTitle = (title) => {
    return title.length > 25 ? `${title.substring(0, 30)}...` : title;
  };
  return (
    <div className="recap-wrapper">
      <h3>Book </h3>
      {error && <p className="recap-error">{error}</p>}
      <div className="recap-book-grid">
        {Array.isArray(displayedBooks) && displayedBooks.length > 0 ? (
          displayedBooks.map((book) => (
            <div key={book.id} className="recap-book-card" onClick={() => handleBookClick(book)}>
              <img src={book.coverImage} alt={book.title} className="recap-book-cover"/>
              <h2>{book.title.length > 26 ? `${book.title.slice(0, 26)}\n${book.title.slice(26)}` : book.title}</h2>
              {book.authors && book.authors.$values.length > 0 && (
                <p><strong>{book.authors.$values[0].name}</strong></p>
              )}
            </div>
          ))
        ) : (
          <p>No books available</p>
        )}
      </div>
      {books.length > 8 && !showAll && (
        <button className="recap-see-more" onClick={() => setShowAll(true)}>
          See more
        </button>
      )}
    </div>
  );
};

export default UserRecapV2;