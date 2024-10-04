import React, { useState } from 'react';
import './WriteRecap.scss';

const WriteRecap = () => {
  const [keyIdeas, setKeyIdeas] = useState([{ title: '', body: '', image: null, imageURL: '', imageDescription: '' }]);

  const handleAddKeyIdea = () => {
    setKeyIdeas([...keyIdeas, { title: '', body: '', image: null, imageURL: '', imageDescription: '' }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedKeyIdeas = [...keyIdeas];
    updatedKeyIdeas[index][field] = value;
    setKeyIdeas(updatedKeyIdeas);
  };

  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    const updatedKeyIdeas = [...keyIdeas];
    updatedKeyIdeas[index].image = file;
    updatedKeyIdeas[index].imageURL = URL.createObjectURL(file); // Tạo URL để xem trước hình ảnh
    setKeyIdeas(updatedKeyIdeas);
  };

  const handleRemoveKeyIdea = (index) => {
    const updatedKeyIdeas = keyIdeas.filter((_, i) => i !== index);
    setKeyIdeas(updatedKeyIdeas);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submitted key ideas: ", keyIdeas);
  };

  return (
    <div className="write-recap-container">
      <h1>Write Recap</h1>
      <form onSubmit={handleSubmit}>
        {keyIdeas.map((keyIdea, index) => (
          <div key={index} className="key-idea">
            <div className="key-idea-header">
              <h2>Key Idea {index + 1}</h2>
              <button type="button" className="remove-button" onClick={() => handleRemoveKeyIdea(index)}>Remove</button>
            </div>
            <div className="form-group">
              <label htmlFor={`title-${index}`}>Title</label>
              <input
                type="text"
                id={`title-${index}`}
                value={keyIdea.title}
                onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                maxLength="150"
                placeholder="Enter the title (max 150 characters)"
                required
              />
              <small>{150 - keyIdea.title.length} characters left</small>
            </div>

            <div className="form-group">
              <label htmlFor={`body-${index}`}>Body</label>
              <textarea
                id={`body-${index}`}
                value={keyIdea.body}
                onChange={(e) => handleInputChange(index, 'body', e.target.value)}
                maxLength="3000"
                placeholder="Enter the body of the idea (max 3000 characters)"
                required
              />
              <small>{3000 - keyIdea.body.length} characters left</small>
            </div>

            <div className="form-group">
              <label htmlFor={`image-${index}`}>Upload Image</label>
              <input
                type="file"
                id={`image-${index}`}
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
              />
            </div>

            {keyIdea.imageURL && (
              <div className="form-group image-preview">
                <label>Image Preview:</label>
                <img src={keyIdea.imageURL} alt={`Key Idea ${index + 1} Preview`} />
              </div>
            )}

            {keyIdea.image && (
              <div className="form-group">
                <label htmlFor={`image-description-${index}`}>Image Description</label>
                <input
                  type="text"
                  id={`image-description-${index}`}
                  value={keyIdea.imageDescription}
                  onChange={(e) => handleInputChange(index, 'imageDescription', e.target.value)}
                  placeholder="Describe the image (optional)"
                />
              </div>
            )}
          </div>
        ))}

        <button type="button" className="add-key-idea-button" onClick={handleAddKeyIdea}>+ Add Key Idea</button>
        <button type="submit" className="submit-button">Submit Recap</button>
      </form>
    </div>
  );
};

export default WriteRecap;
