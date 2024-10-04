import React, { useEffect, useState } from 'react';
import './BookApiDetail.scss';

const BookApiDetail = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMTQ5ZWE4YS02MjE5LTQ2MzQtOWViOC00MzAyYjllNDhkN2MiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTI1LjIzNS4yMzguMTgxIiwiaW1hZ2VfdXJsIjoiRmlsZXMvSW1hZ2UvanBnL2FkLmpwZyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNvbnRyaWJ1dG9yIiwiZXhwIjoxNzI4MDM3NDQyLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTI0IiwiYXVkIjoiYm9va3JlY2FwIn0.2pxH0Wl60kyv6b2iIB16ky1EuZbyt5oMfKV0c9WkWDg';


    try {
      const response = await fetch('https://160.25.80.100:7124/api/book', {
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

  return (
    <div className="book-api-detail">
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <ul className="book-detail-list">
        {books.map(book => (
          <li key={book.id} className="book-detail-item">
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
