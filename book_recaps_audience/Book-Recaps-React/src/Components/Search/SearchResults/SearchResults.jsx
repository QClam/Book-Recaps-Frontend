import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResult = () => {
  const [filteredBooks, setFilteredBooks] = useState([]);
  const navigate = useNavigate();
  const query = useQuery();
  const searchQuery = query.get("query") || "";

  useEffect(() => {
    const fetchBooks = async () => {
      // Assuming the search results are directly passed in the URL
      const results = query.get("results");
      if (results) {
        setFilteredBooks(JSON.parse(results));
      } else {
        // Fallback or error handling if results are not found
        setFilteredBooks([]);
      }
    };

    fetchBooks();
  }, [query]);

  return (
    <div className="search-results-container">
      {filteredBooks.length > 0 ? (
        filteredBooks.map((book) => (
          <div key={book.id} className="book-item">
            <h3>{book.title}</h3>
            {/* Add more book details here */}
          </div>
        ))
      ) : (
        <p>No books found for "{searchQuery}".</p>
      )}
    </div>
  );
};

export default SearchResult;
