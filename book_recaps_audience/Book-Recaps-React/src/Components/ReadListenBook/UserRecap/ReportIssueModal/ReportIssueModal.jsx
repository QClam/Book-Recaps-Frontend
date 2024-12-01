// ReportIssueModal.js
import { useState } from 'react';
import './ReportIssueModal.scss';
import { axiosInstance } from "../../../../utils/axios";
import { toast } from "react-toastify";

const ReportIssueModal = ({ isOpen, onClose, recapId, userId }) => {
  const [ category, setCategory ] = useState('');
  const [ description, setDescription ] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/supportticket/create', {
        category,
        description,
        status: 0,
        recapId: recapId,
        userId: userId
      });
      console.log('Report response:', response.data);
      toast.success('Issue reported successfully!');
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue.');
    }
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
