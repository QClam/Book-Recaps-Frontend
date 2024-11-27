import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "../ContractDetail/ContractDetail.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';

const resolveRefs = (data) => {
  const refMap = new Map();
  const createRefMap = (obj) => {
    if (typeof obj !== "object" || obj === null) return;
    if (obj.$id) {
      refMap.set(obj.$id, obj);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        createRefMap(obj[key]);
      }
    }
  };
  const resolveRef = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    if (obj.$ref) {
      return refMap.get(obj.$ref);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = resolveRef(obj[key]);
      }
    }
    return obj;
  };
  createRefMap(data);
  return resolveRef(data);
};


const ContractDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApproved, setIsApproved] = useState(false); // Track if approved
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Modal visibility state
  const [books, setBooks] = useState([]); // State for books
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isRejected, setIsRejected] = useState(false); 
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
        const contractDetail = resolveRefs(response.data.data);
        // resolveRefs(setContract(response.data.data)); // Lưu thông tin hợp đồng vào state
        // resolveRefs( setBooks(response.data.data.books?.$values || [])); // Set book data
        // console.log(response.data.data.books?.$values || [])
        // console.log(response.data.data)
        setContract(contractDetail);
       console.log(contractDetail);

       const bookContract = contractDetail.books?.$values || [];
       console.log(bookContract);
       setBooks(bookContract);

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
      } else if (newStatus === 5) {
        setIsApproved(false);
      }
    } catch (error) {
      console.error("Error changing contract status:", error);
      alert("Có lỗi xảy ra khi thay đổi trạng thái hợp đồng.");
    }
  };
  const confirmApprove = () => {
    handleStatusChange(2); // Set trạng thái "Chấp thuận"
    setShowConfirmModal(false); // Đóng modal
    setIsApproved(true); // Đánh dấu đã "Chấp thuận"
    setIsRejected(false); // Vô hiệu hóa "Từ chối"
  };
  
  const confirmReject = () => {
    handleStatusChange(5); // Set trạng thái "Từ chối"
    setShowRejectModal(false); // Đóng modal
    setIsRejected(true); // Đánh dấu đã "Từ chối"
    setIsApproved(false); // Vô hiệu hóa "Chấp thuận"
  };
  


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="contract-detail">
      <h2>Contract Detail</h2>
      <div className="info-box">
        <p><strong>Publisher:</strong> {contract.publisherId}</p>
         <p>{contract.publisher.publisherName || ""}</p> 
         <p><strong>Contact Info:</strong> {contract.publisher.contactInfo || "N/A"}</p>
        <p><strong>Bank Account:</strong> {contract.publisher.bankAccount || "N/A"}</p>
        <p><strong>Phần trăm chia sẻ doanh thu:</strong> <span>{contract.revenueSharePercentage}%</span></p>
        <p><strong>Ngày tạo:</strong> {new Date(contract.startDate).toLocaleDateString()}</p>
        <p><strong>Ngày bắt đầu:</strong> {new Date(contract.startDate).toLocaleDateString()}</p>
        <p><strong>Ngày kết thúc:</strong> {new Date(contract.endDate).toLocaleDateString()}</p>
        <p><strong>Trạng thái:</strong> <span className="status">{getStatusLabel(contract.status)}</span></p>
        <div className="buttons">
        <div className="buttons">
  <button
    className="edit-btn"
    onClick={() => setShowRejectModal(true)}
    disabled={isApproved || contract?.status === 2} // Disable nếu đã "Chấp thuận"
  >
    Từ chối
  </button>

  <button
    className="approve-btn"
    onClick={() => setShowConfirmModal(true)}
    disabled={isRejected || contract?.status === 5} // Disable nếu đã "Từ chối"
  >
    Chấp thuận
  </button>
</div>


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
          {/* Books Table */}
      <div className="books-section">
        <h3>Danh sách sách</h3>
        <table className="books-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Original Title</th>
              <th>Description</th>
              <th>Publication Year</th>
              <th>Cover Image</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => (
              <tr key={index}>
                <td>{book.title}</td>
                <td>{book.originalTitle}</td>
                <td>{book.description}</td>
                <td>{book.publicationYear}</td>
                <td>
                  <img src={book.coverImage} alt={book.title} width="50" height="75" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


          
       {/* Confirmation Modal */}
       {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Bạn chắc chắn?</h3>
            <p>Tôi đã đọc lại văn bản cam kết ở trong tệp đính kèm và đồng ý toàn bộ nội dung trên, đồng thời ký, điểm chỉ vào văn bản cam kết này.</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>
                Hủy bỏ
              </button>
              <button className="confirm-btn" onClick={confirmApprove}>
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Bạn muốn hủy hợp đồng này?</h3>
            <p>Nếu hủy, hợp đồng sẽ không còn hiệu lực.</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowRejectModal(false)}>
                Hủy bỏ
              </button>
              <button className="confirm-btn" onClick={confirmReject}>
                Đồng ý
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
    case 0: return "Bản nháp";
    case 1: return "Đang xử lý";
    case 2: return "Chưa bắt đầu";
    case 3: return "Đang kích hoạt";
    case 4: return "Hết hạn";
    case 5: return "Từ chối";
    default: return "Unknown";
  }
};

export default ContractDetail;
