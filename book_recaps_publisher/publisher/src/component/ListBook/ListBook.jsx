import React, { useState, useEffect } from 'react';
import './ListBook.scss';

const ListBook = () => {
  const [books, setBooks] = useState([]);
  const query = 'fiction'; // You can change this to any query

  useEffect(() => {
    // Fetch book data from the Google Books API
    const fetchBooks = async () => {
      const apiKey = 'AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc';
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`
      );
      const data = await response.json();
      setBooks(data.items || []);
    };
    fetchBooks();
  }, []);

  return (
    <div className="list-book-container">
      <h1>List of books for approval</h1>
      <table className="book-table">
        <thead>
          <tr>
            <th>Approval</th>
            <th>Genre</th>
            <th>Title</th>
            <th>Author</th>
            <th>Guidelines</th> {/* Added Guidelines column */}
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => (
            <tr key={index}>
              <td><input type="checkbox" /></td>
              <td>
                <span className={`tag ${book.volumeInfo.categories ? book.volumeInfo.categories[0].toLowerCase() : 'unknown'}`}>
                  {book.volumeInfo.categories ? book.volumeInfo.categories[0] : 'Unknown'}
                </span>
              </td>
              <td>{book.volumeInfo.title}</td>
              <td>{book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author'}</td>
              <td>
                {/* This is where you can add a link or instructions */}
                <a href="#" className="guidelines-link">View Guidelines</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Submit Approve Button */}
      <div className="submit-approve-container">
        <button className="submit-approve-btn">Submit Approve</button>
      </div>
    </div>
  );
};

export default ListBook;
