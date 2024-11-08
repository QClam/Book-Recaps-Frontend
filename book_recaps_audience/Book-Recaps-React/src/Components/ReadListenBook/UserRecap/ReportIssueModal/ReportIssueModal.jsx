// ReportIssueModal.js
import React, { useState } from 'react';
import './ReportIssueModal.scss';

const ReportIssueModal = ({ isOpen, onClose, onSubmit }) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ category, description });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="overlay-wrapper"> {/* Đổi tên từ modal-overlay */}
      <div className="content-container"> {/* Đổi tên từ modal-content */}
        <h3>Report an Issue</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </label>
          <label>
            Describe the issue:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </label>
          <button type="submit">Submit</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssueModal;
