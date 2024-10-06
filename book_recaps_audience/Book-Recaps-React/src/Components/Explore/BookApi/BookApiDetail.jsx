// BookApiDetail.jsx
import React, { useEffect, useState } from 'react';
import './BookApiDetail.scss';
import { useNavigate } from 'react-router-dom';

const BookApiDetail = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchBooks = async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmN2JhMGVmNy0xNGU5LTRiMWUtOTMzZi0zNjUxYjYxODI2YjAiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTE2LjExMC40MS45MCIsImltYWdlX3VybCI6IkZpbGVzL0ltYWdlL2pwZy9hZC5qcGciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb250cmlidXRvciIsImV4cCI6MTcyODIxMTA4NCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzEyNCIsImF1ZCI6ImJvb2tyZWNhcCJ9.9kBr24PfBlXZcVWUySL2_VJfy7QH7DPdsfQnuuqygZg'
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
      setBooks(data.data.$values);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBookClick = (id) => {
    navigate(`/book/${id}`);
  };

  return (
    <div className="book-api-detail">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul className="book-detail-list">
        {books.map(book => (
          <li
            key={book.id}
            className="book-detail-item"
            onClick={() => handleBookClick(book.id)}
            style={{ cursor: 'pointer' }}
          >
            <h2>{book.title}</h2>
            <h3>{book.originalTitle}</h3>
            <p>{book.description}</p>
            <p><strong>Publication Year:</strong> {book.publicationYear}</p>
            {book.coverImage && <img src={book.coverImage} alt={book.title} className="book-detail-cover" />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookApiDetail;
