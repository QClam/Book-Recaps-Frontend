import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReadRecapNew.scss';
import { axiosInstance } from "../../../utils/axios";

const ReadRecapNew = () => {
  const [ books, setBooks ] = useState([]);
  const [ error, setError ] = useState(null);
  const [ showAll, setShowAll ] = useState(false); // state to toggle "see more"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get('/api/book/getallbooks');
        const data = response.data;
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

  // const handleBookClick = (id) => {
  //   navigate(`/bookdetailbook/${id}`); // Use the book's id for navigation
  // };
  const handleBookClick = (id) => {
    navigate(`/user-recap-detail/${id}`); // Navigate to UserRecapDetail with the book ID
  };
  //chay qua class BookDetailBook
  const handleSeeMore = () => {
    navigate('/all-books-recap'); // Navigate to a page displaying all books
  };

  const displayedBooks = showAll ? books : books.slice(20, 32); // Display the last 8 books

  return (
    <div className="book-display-container">
      <h1 className="bookh1">Trending</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="book-list-book">
        {Array.isArray(displayedBooks) && displayedBooks.length > 0 ? (
          displayedBooks.map((book) => (
            <div key={book.id} className="book-item-book" onClick={() => handleBookClick(book.id)}>
              <img src={book.coverImage} alt={book.title} className="book-cover-book"/>
              <h2>{book.title}</h2>
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
        <button className="see-more-button" onClick={handleSeeMore}>
          See more
        </button>
      )}
    </div>

  );
};

export default ReadRecapNew;
