import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../BookDetail/BookDetail.scss';
import AudioGrid from '../BookListen/AudioGrid';

const BookDetail = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const book = location.state?.book;
  const [showAudioGrid, setShowAudioGrid] = useState(false);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  

  if (!book) return <div>Loading...</div>;

  const handleReadClick = () => {
    navigate('/read', { state: { book } }); // Điều hướng ngay lập tức đến trang Read
  };
  
  const handleListenClick = () => {
    setShowAudioGrid(true); // Hiển thị AudioGrid nếu bạn cần
    // Chỉ hiển thị AudioGrid mà không điều hướng, đợi người dùng bấm "Read"
  };

  const handleLikeClick = () => {
    setLiked(!liked);
  };

  const handleSaveInLibrary = () => {
    alert("Book saved in your library!");
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment) {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  return (
    <div className="book-detail-container">
      <div className="book-detail-content">
        <div className="book-header">
          <div className="book-thumbnail">
            <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
          </div>
          <div className="book-info">
            <h1 className="book-title">{book.volumeInfo.title}</h1>
            <div className="author-container">
              <h2 className="book-author">{book.volumeInfo.authors?.join(', ')}</h2>
              <button className="following-button">Following</button>
            </div>
            <p className="book-subtitle">{book.volumeInfo.subtitle || 'No subtitle available'}</p>
            <div className="book-detail-meta">
              <div className="meta-row">
                <div className="meta-icon meta-rating">
                  ⭐ <span>{book.volumeInfo.averageRating || '4.5'}</span> ({book.volumeInfo.ratingsCount || '1115'} ratings)
                </div>
                <div className="meta-icon meta-duration">
                  ⏱ <span>20 mins</span>
                </div>
              </div>
              <div className="meta-row">
                <div className="meta-icon meta-format">
                  🎧 Audio & text
                </div>
                <div className="meta-icon meta-key-ideas">
                  💡 9 Key ideas
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="book-detail-actions">
          <button className="action-button read-button" onClick={handleListenClick}>Listen</button>
          <button className="action-button play-button" onClick={handleReadClick}>Read</button>
        </div>

        <div className="book-saved">
          <span className="saved-label" onClick={handleSaveInLibrary}>🔖 Save in My Library</span>
          <span className="saved-like" onClick={handleLikeClick}>
            {liked ? '❤️ Liked' : '🤍 Like'}
          </span>
        </div>

        <div className="book-category">
          <span className="category-label">Category: {book.volumeInfo.categories?.join(', ') || 'Unknown'}</span>
        </div>

        <div className="book-description">
          <p>{book.volumeInfo.description || "No description available."}</p>
        </div>

        {/* Comment Section */}
        <div className="comment-section">
          <h3>Comments</h3>
          <form onSubmit={handleCommentSubmit}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
            />
            <button type="submit">Post</button>
          </form>
          <div className="comments-list">
            {comments.length === 0 ? (
              <p>No comments yet</p>
            ) : (
              comments.map((comment, index) => <p key={index}>{comment}</p>)
            )}
          </div>
        </div>
      </div>

      {/* Audio section aligned to the right */}
      {showAudioGrid && (
        <div className="book-audio-grid">
          <AudioGrid />
        </div>
      )}
    </div>
  );
};

export default BookDetail;
