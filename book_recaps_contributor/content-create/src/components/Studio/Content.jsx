import React, { useState } from 'react';
import '../Studio/Content.scss'; // Add styles here

// tóm tắt sách bdd viết content
const Content = () => {
  const [keyIdeas, setKeyIdeas] = useState([
    { title: '', body: '', image: null, imageDescription: '' }
  ]);

  const handleAddKeyIdea = () => {
    setKeyIdeas([...keyIdeas, { title: '', body: '', image: null, imageDescription: '' }]);
  };

  const handleKeyIdeaChange = (index, field, value) => {
    const updatedIdeas = keyIdeas.map((idea, i) =>
      i === index ? { ...idea, [field]: value } : idea
    );
    setKeyIdeas(updatedIdeas);
  };

  const handleImageUpload = (index, file) => {
    const updatedIdeas = keyIdeas.map((idea, i) =>
      i === index ? { ...idea, image: file } : idea
    );
    setKeyIdeas(updatedIdeas);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here, e.g., sending data to the backend
  };

  return (
    <div className="content-container">
      <h2>Nhập các ý chính của sách</h2>
      <form onSubmit={handleFormSubmit}>
        {keyIdeas.map((idea, index) => (
          <div key={index} className="key-idea">
            <label>
              Tiêu đề ý chính ({150 - idea.title.length} ký tự còn lại):
              <input
                type="text"
                value={idea.title}
                maxLength="150"
                onChange={(e) => handleKeyIdeaChange(index, 'title', e.target.value)}
                placeholder="Nhập tiêu đề ý chính"
              />
            </label>
            <label>
              Nội dung ý chính ({3000 - idea.body.length} ký tự còn lại):
              <textarea
                value={idea.body}
                maxLength="3000"
                onChange={(e) => handleKeyIdeaChange(index, 'body', e.target.value)}
                placeholder="Nhập nội dung của ý chính"
              />
            </label>
            <label>
              Hình ảnh (tùy chọn):
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(index, e.target.files[0])}
              />
            </label>
            <label>
              Mô tả hình ảnh (tùy chọn):
              <input
                type="text"
                value={idea.imageDescription}
                onChange={(e) => handleKeyIdeaChange(index, 'imageDescription', e.target.value)}
                placeholder="Nhập mô tả cho hình ảnh"
              />
            </label>
          </div>
        ))}

        <button type="button" className="add-key-idea-btn" onClick={handleAddKeyIdea}>
          Thêm ý chính mới
        </button>
        <button type="submit" className="submit-btn">
          Lưu tóm tắt
        </button>
      </form>
    </div>
  );
};

export default Content;
