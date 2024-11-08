import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../ListCategory/BookByCategory.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';

const BooksByCategory = () => {
    const [books, setBooks] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    // Extract category from query parameter
    const category = new URLSearchParams(location.search).get('category');

    useEffect(() => {
        const fetchBooksByCategory = async () => {
            try {
                
                const response = await axios.get(``);
                setBooks(response.data.items);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        if (category) {
            fetchBooksByCategory();
        }
    }, [category]);

    const handleBookClick = (book) => {
        navigate(`/bookbycategory/${book.id}`, { state: { book } });
      };
    return (
        <div className="category-books-wrapper">
            <h2>Popular in {category}</h2>
            <p>Whats popular in {category}?</p>
            <div className="books-row">
                {books.length === 0 ? (
                    <p>Loading books...</p>
                ) : (
                    books.map((book, index) => (
                        <div key={index} className="single-book"  onClick={() => handleBookClick(book)}>
                            <img 
                                src={book.volumeInfo.imageLinks?.thumbnail} 
                                alt={book.volumeInfo.title} 
                                className="book-thumbnail" 
                            />
                            <div className="book-info">
                                <h3 className="book-heading">{book.volumeInfo.title}</h3>
                                <p className="book-writer">{book.volumeInfo.authors?.join(', ')}</p>
                                <p className="book-summary">{book.volumeInfo.description?.substring(0, 100)}...</p>
                                <div className="book-meta-data">
                                    <span className="book-read-time">
                                        <i className="fas fa-clock"></i> {Math.floor(Math.random() * 30) + 10} min
                                    </span>
                                    <span className="book-review-rating">
                                        <i className="fas fa-star"></i> {book.volumeInfo.averageRating || '4.0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BooksByCategory;
