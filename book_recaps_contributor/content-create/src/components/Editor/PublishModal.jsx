import React from 'react';
import '../Editor/PublishModal.scss';
// popup public khi bấm nút Publish
const PublishModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2 className="modal-title">Preview</h2>
        <div className="modal-body">
          <div className="image-preview">
            <img src="path_to_image" alt="Blog Preview" />
            <div className="blog-details">
              <h3 className="blog-title">test blog 1</h3>
              <p className="blog-description">this is a sample short description about this blog.</p>
            </div>
          </div>

          <div className="form-section">
            <label>Blog Title</label>
            <input type="text" className="input-field" value="test blog 1" readOnly />

            <label>Short Description about your post</label>
            <textarea className="textarea-field" value="this is a sample short description about this blog." readOnly />

            <label>Topics - (Helps in searching and ranking your post)</label>
            <input type="text" className="input-field" placeholder="Topic" />

            <button className="publish-button">Publish</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
