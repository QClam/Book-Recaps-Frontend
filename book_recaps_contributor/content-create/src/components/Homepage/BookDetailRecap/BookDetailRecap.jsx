import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../BookDetailRecap/BookDetailRecap.scss';

const BookDetailRecap = () => {
  const location = useLocation();
  const book = location.state?.book;

  // State for storing key ideas
  const [keyIdeas, setKeyIdeas] = useState([{ title: '', body: '', image: null, imageDescription: '' }]);

  if (!book) return <div>Loading...</div>;

  // Handle change in key idea input fields
  const handleKeyIdeaChange = (index, field, value) => {
    const updatedKeyIdeas = [...keyIdeas];
    updatedKeyIdeas[index][field] = value;
    setKeyIdeas(updatedKeyIdeas);
  };

  // Add new key idea
  const addKeyIdea = () => {
    setKeyIdeas([...keyIdeas, { title: '', body: '', image: null, imageDescription: '' }]);
  };

  // Handle image upload
  const handleImageUpload = (index, event) => {
    const updatedKeyIdeas = [...keyIdeas];
    updatedKeyIdeas[index].image = event.target.files[0];
    setKeyIdeas(updatedKeyIdeas);
  };

  return (
    <div className="book-recap-container">
      <div className="book-header">
        <div className="book-thumbnail">
          <img src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
        </div>
        <div className="book-info">
          <h1 className="book-title">{book.volumeInfo.title}</h1>
        </div>
      </div>

      <div className="recap-form">
        <h2 className="recap-title">Contribute Key Ideas</h2>

        {keyIdeas.map((idea, index) => (
          <div className="key-idea" key={index}>
            <label className="idea-label">Key Idea {index + 1}</label>
            
            <input
              type="text"
              className="key-idea-title"
              placeholder="Enter key idea title (max 150 characters)"
              maxLength="150"
              value={idea.title}
              onChange={(e) => handleKeyIdeaChange(index, 'title', e.target.value)}
            />

            <textarea
              className="key-idea-body"
              placeholder="Enter key idea body (max 3000 characters)"
              maxLength="3000"
              value={idea.body}
              onChange={(e) => handleKeyIdeaChange(index, 'body', e.target.value)}
            />

            <div className="key-idea-image">
              <label>Upload Image (optional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e)}
              />
            </div>

            {idea.image && (
              <div className="image-preview">
                <img src={URL.createObjectURL(idea.image)} alt={`Idea ${index + 1}`} />
                <textarea
                  className="image-description"
                  placeholder="Enter image description (optional)"
                  value={idea.imageDescription}
                  onChange={(e) => handleKeyIdeaChange(index, 'imageDescription', e.target.value)}
                />
              </div>
            )}
          </div>
        ))}

        <button className="add-idea-button" onClick={addKeyIdea}>
          Add Another Key Idea
        </button>
      </div>
      
      <button type="submit" className="submit-button">Submit Recap</button>
    </div>
  );
};

export default BookDetailRecap;
