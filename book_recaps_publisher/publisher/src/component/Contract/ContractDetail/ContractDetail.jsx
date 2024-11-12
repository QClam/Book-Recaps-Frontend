import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "../ContractDetail/ContractDetail.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';

const ContractDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApproved, setIsApproved] = useState(false); // Track if approved
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal visibility state


  const accessToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchContractDetail = async () => {
      try {
        const response = await axios.get(
          `https://160.25.80.100:7124/api/Contract/getcontractby/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setContract(response.data.data); // Lưu thông tin hợp đồng vào state
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchContractDetail();
  }, [id, accessToken]);

  // Hàm thay đổi trạng thái hợp đồng
  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(
        `https://160.25.80.100:7124/api/Contract/change-status/${id}`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Cập nhật trạng thái hợp đồng trong giao diện
      setContract((prevContract) => ({
        ...prevContract,
        status: newStatus,
      }));
      if (newStatus === 2) {
        setIsApproved(true);
      } else if (newStatus === 4) {
        setIsApproved(false);
      }
    } catch (error) {
      console.error("Error changing contract status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái hợp đồng.");
    }
  };
  const confirmApprove = () => {
    handleStatusChange(2); // Set status to "Approved"
    setShowConfirmModal(false); // Close modal
  };



  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="contract-detail">
      <h2>Contract Detail</h2>
      <div className="info-box">
        <p><strong>Publisher:</strong> {contract.publisherId}</p>
        <p><strong>Phần trăm chia sẻ doanh thu:</strong> <span>{contract.revenueSharePercentage}%</span></p>
        <p><strong>Ngày tạo:</strong> {new Date(contract.startDate).toLocaleDateString()}</p>
        <p><strong>Ngày bắt đầu:</strong> {new Date(contract.startDate).toLocaleDateString()}</p>
        <p><strong>Ngày kết thúc:</strong> {new Date(contract.endDate).toLocaleDateString()}</p>
        <p><strong>Trạng thái:</strong> <span className="status">{getStatusLabel(contract.status)}</span></p>
        <div className="buttons">
        <button 
            className="edit-btn" 
            onClick={() => handleStatusChange(4)} 
            disabled={isApproved} // Disable if approved
          >
            Từ chối
          </button>
          <button 
            className="approve-btn" 
            onClick={() => setShowConfirmModal(true)}
          >
            Chấp thuận
          </button>

        </div>
      </div>
      <div className="attachments">
        <h3>Tài liệu đính kèm:</h3>
        <div className="attachment-list">
          {contract.contractAttachments.$values.map((attachment, index) => (
            <div key={index} className="attachment-item">
              {/* <img src={attachment.attachmentURL || "placeholder.png"} alt="Preview" /> */}
              <div className="attachment-preview">
                <a href={attachment.attachmentURL} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faPaperclip} size="1.9x" />

                </a>
                </div>
              <div className="doc-name">{attachment.name}</div>
              <div className="doc-date">Ngày tạo: {new Date(attachment.createdAt).toLocaleDateString()}</div>

            </div>
          ))}
        </div>
      </div>

       {/* Confirmation Modal */}
       {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Bạn chắc chắn?</h3>
            <p>Tôi đã đọc lại văn bản cam kết này và đồng ý toàn bộ nội dung trên, đồng thời ký, điểm chỉ vào văn bản cam kết này.</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmApprove}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
  
};

// Hàm để ánh xạ status thành tên
const getStatusLabel = (status) => {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "NotStarted";
    case 2:
      return "Approved";
    case 3:
      return "Expired";
    case 4:
      return "Rejected";
    default:
      return "Unknown";
  }
};

export default ContractDetail;
