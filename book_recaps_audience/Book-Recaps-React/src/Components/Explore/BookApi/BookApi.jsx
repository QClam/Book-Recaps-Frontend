import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import "./BookApi.css"; // Import your CSS for styling

const BookApi = () => {
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState(null); // For error handling
  const booksPerPage = 10; // Number of books per page
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NWRmM2ExZC04NWY5LTQ2MzMtYTAwZC01ZTg0MjFiZWI3ZTQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTE2LjExMC40MS45MCIsImltYWdlX3VybCI6IkZpbGVzL0ltYWdlL2pwZy9hZC5qcGciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb250cmlidXRvciIsImV4cCI6MTcyODIyODA3NiwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzEyNCIsImF1ZCI6ImJvb2tyZWNhcCJ9.S6zTH1h6IdHOHndAtLhY7B_rVcnSBb1-Elqii75QX4Q"; // Replace with your actual token

  useEffect(() => {
    // Fetch the book data from the API
    const fetchBooks = async () => {
      try {
        const response = await fetch('https://160.25.80.100:7124/api/book/getallbooks', {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
        }

        const data = await response.json();
        if (data && data.data && Array.isArray(data.data.$values)) {
          setBooks(data.data.$values); // Assuming book data is in `data.$values`
        } else {
          setBooks([]); // If no data is present, set an empty array
        }
      } catch (error) {
        setError(error.message);
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, [token]);

  // Calculate pagination
  const pageCount = books.length > 0 ? Math.ceil(books.length / booksPerPage) : 1;
  const offset = currentPage * booksPerPage;
  const currentBooks = books.length > 0 ? books.slice(offset, offset + booksPerPage) : [];

  // Handle page click for pagination
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="book-api-container">
      <h1 className="title">Book List</h1>

      {error && <p className="error">Error: {error}</p>}

      <div className="book-list">
        {currentBooks.length > 0 ? (
          currentBooks.map((book) => (
            <div className="book-itemem" key={book.$id}>
              {book.coverImage && (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="book-cover"
                />
              )}
              <h2>{book.title}</h2>
              <h3>{book.originalTitle}</h3>
              {/* <p>{book.description}</p> */}
              <p><strong>Publication Year:</strong> {book.publicationYear}</p>
              
              {/* Show first author */}
              {book.authors && book.authors.$values.length > 0 && (
                <p><strong>Author:</strong> {book.authors.$values[0].name}</p>
              )}
            </div>
          ))
        ) : (
          <p>No books found.</p>
        )}
      </div>

      {/* Pagination */}
      {books.length > 0 && (
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
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
