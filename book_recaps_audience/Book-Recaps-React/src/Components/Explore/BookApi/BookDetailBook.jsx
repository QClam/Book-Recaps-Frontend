import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "../BookApi/BookDetailBook.scss";
import ListenPart from '../../ReadListenBook/ListenPart/ListenPart';
import { useNavigate } from 'react-router-dom';
const BookDetailBook = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [transcriptData, setTranscriptData] = useState(null);
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const fetchBookDetail = async () => {
    try {
      const response = await axios.get(`https://160.25.80.100:7124/api/book/getbookbyid/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      if (data && data.data) {
        setBook(data.data);
      } else {
        setBook(null);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching book detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetail();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!book) {
    return <div>No book found.</div>;
  }
  const handleBookClick = (bookId) => {
    navigate(`/recap/${bookId}`);
  };
  //nhaytoi class RecapDetail
  const handleLikeClick = () => {
    setLiked(!liked);
  };

  return (
    <div className="book-detail-container">
      <div className="book-detail-content">
        {/* Book Header: Cover and Basic Info */}
        <div className="book-header">
          <div className="book-thumbnail">
            {book.coverImage && (
              <img
                src={book.coverImage}
                alt={book.title}
                className="book-detail-cover"
              />
            )}
          </div>

          <div className="book-info">
            <h1 className="book-title">{book.title}</h1>
            <div className="author-container">
              <h2 className="book-author">
                {book.authors && book.authors.$values.length > 0
                  ? book.authors.$values[0].name
                  : 'Unknown Author'}
              </h2>
              
            </div>
            <p className="book-subtitle">Original Title: {book.originalTitle || 'No original title available'}</p>

            <div className="book-detail-meta">
              <div className="meta-row">
                {/* <div className="meta-icon meta-rating">
                  ⭐ <span>{book.rating || '4.5'}</span> (1115 ratings)
                </div>
                <div className="meta-icon meta-duration">
                  ⏱ <span>{book.readTime || '20 mins'}</span>
                </div> */}
              </div>
              <div className="meta-row">
                <div className="meta-icon meta-format">🎧 Audio & text</div>
                <div className="meta-icon meta-key-ideas">💡 9 Key ideas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Book Actions */}
        <div className="book-detail-actions">
          {/* <button className="action-button listen-button">Listen</button> */}
          <button className="action-button play-button" onClick={handleBookClick}>Read</button>
        </div>

        {/* Book Save and Like Section */}
        <div className="book-saved">
          <span className="saved-label" onClick={() => alert("Book saved in your library!")}>
            🔖 Save in My Library
          </span>
          <span className="saved-like" onClick={handleLikeClick}>
            {liked ? '❤️ Liked' : '🤍 Like'}
          </span>
        </div>

        {/* Book Category */}
        <div className="book-category">
          <span className="category-label">
            Category: {book.category || 'Unknown'}
          </span>
        </div>

        {/* Book Description */}
        <div className="book-description">
          <p>{book.description || 'No description available.'}</p>
        </div>
      </div>

      <div className="recap-details">
      {/* Pass props to ListenPart */}
      <ListenPart
        audioURL={audioURL}
        transcriptData={transcriptData}
        accessToken={accessToken}
        refreshToken={refreshToken}
      />
    </div>
    </div>
  );
};

export default BookDetailBook;
