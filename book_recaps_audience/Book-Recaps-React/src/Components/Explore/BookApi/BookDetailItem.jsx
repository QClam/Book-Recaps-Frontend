// BookDetailItem.jsx
import React, { useEffect, useState } from 'react';
import './BookDetailItem.scss';
import { useParams } from 'react-router-dom';

const BookDetailItem = () => {
  const { id } = useParams(); // Get the book ID from the route parameters
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookDetail = async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiNTE1Yjg2OC02ODA0LTQ2MjQtYjIxYS1iOGRmNjMyNzQ4YzIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTI1LjIzNS4yMzguMTgxIiwiaW1hZ2VfdXJsIjoiRmlsZXMvSW1hZ2UvanBnL2FkLmpwZyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNvbnRyaWJ1dG9yIiwiZXhwIjoxNzI4MDU1Mjc2LCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTI0IiwiYXVkIjoiYm9va3JlY2FwIn0.Ndwao4p_e83a1c0WjnQWdGZV0ZlZ6kSk7tcfpHJiSUI'; // Consider storing this securely

    try {
      const response = await fetch(`https://160.25.80.100:7124/api/book/getbookbyid/${id}`, { // Assuming there's an endpoint to get a book by ID
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
      setBook(data.data); // Assuming the response structure
    } catch (error) {
      console.error('Error fetching book detail:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetail();
  }, [id]);

  if (loading) {
    return <div className="book-detail-item"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="book-detail-item"><p>Error: {error}</p></div>;
  }

  if (!book) {
    return <div className="book-detail-item"><p>No book found.</p></div>;
  }

  return (
    <div className="book-detail-item">
      <h1>{book.title}</h1>
      <h2>Original Title: {book.originalTitle}</h2>
      <p><strong>Description:</strong> {book.description}</p>
      <p><strong>Publication Year:</strong> {book.publicationYear}</p>
      <p><strong>Age Limit:</strong> {book.ageLimit}</p>
      <p><strong>Publisher ID:</strong> {book.publisherId}</p>
      {/* If publisher data is available, display it */}
      {book.publisher && (
        <div>
          <h3>Publisher Details</h3>
          <p>ID: {book.publisher.id}</p>
          <p>Name: {book.publisher.name}</p>
          {/* Add more publisher fields as needed */}
        </div>
      )}
      <div>
        <h3>Authors</h3>
        {book.authors && book.authors.$values.length > 0 ? (
          <ul>
            {book.authors.$values.map(author => (
              <li key={author.id}>
                <p><strong>Name:</strong> {author.name}</p>
                <p><strong>Description:</strong> {author.description}</p>
                {/* Add more author fields as needed */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No authors available.</p>
        )}
      </div>
      <div>
        <h3>Categories</h3>
        {book.categories && book.categories.$values.length > 0 ? (
          <ul>
            {book.categories.$values.map(category => (
              <li key={category.id}>
                <p><strong>Name:</strong> {category.name}</p>
                <p><strong>Description:</strong> {category.description}</p>
                {/* Add more category fields as needed */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No categories available.</p>
        )}
      </div>
      {/* Display other fields as needed, such as recaps, earnings, contracts, etc. */}
      {book.recaps && (
        <div>
          <h3>Recaps</h3>
          {/* Render recaps */}
        </div>
      )}
      {book.bookEarnings && (
        <div>
          <h3>Book Earnings</h3>
          {/* Render earnings */}
        </div>
      )}
      {book.contracts && (
        <div>
          <h3>Contracts</h3>
          {/* Render contracts */}
        </div>
      )}
      {book.coverImage && <img src={book.coverImage} alt={book.title} className="book-detail-cover" />}
      {/* Display createdAt and updatedAt if necessary */}
      <p><strong>Created At:</strong> {new Date(book.createdAt).toLocaleString()}</p>
      <p><strong>Updated At:</strong> {book.updatedAt !== "0001-01-01T00:00:00" ? new Date(book.updatedAt).toLocaleString() : 'Not updated'}</p>
    </div>
  );
};

export default BookDetailItem;
