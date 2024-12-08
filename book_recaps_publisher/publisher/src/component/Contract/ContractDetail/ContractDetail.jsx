import { useEffect, useState } from 'react';
import { generatePath, Link, useParams } from 'react-router-dom';
import "../ContractDetail/ContractDetail.scss"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { axiosInstance } from "../../../utils/axios";
import CustomBreadCrumb from "../../CustomBreadCrumb";
import { routes } from "../../../routes";
import { Divider } from "primereact/divider";
import Show from "../../Show";
import { cn } from "../../../utils/cn";
import Table from "../../table";
import { Image } from "primereact/image";

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
  const [ contract, setContract ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const [ isApproved, setIsApproved ] = useState(false); // Track if approved
  const [ showConfirmModal, setShowConfirmModal ] = useState(false); // Modal visibility state
  const [ books, setBooks ] = useState([]); // State for books
  const [ showRejectModal, setShowRejectModal ] = useState(false);
  const [ isRejected, setIsRejected ] = useState(false);

  useEffect(() => {
    const fetchContractDetail = async () => {
      try {
        const response = await axiosInstance.get(`/api/Contract/getcontractby/${id}`);
        const contractDetail = resolveRefs(response.data.data);

        setContract(contractDetail);

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
  }, []);

  // Hàm thay đổi trạng thái hợp đồng
  const handleStatusChange = async (newStatus) => {
    try {
      await axiosInstance.put(`/api/Contract/change-status/${id}`, { status: newStatus });

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
    <>
      <CustomBreadCrumb items={[ { label: "Contracts", path: routes.contracts }, { label: "Contract detail" } ]}/>

      <div className="contract-detail">
        <h2>Contract Detail</h2>
        <div className="info-box">
          <p><strong>Tên Nhà xuất bản: </strong>{contract.publisher.publisherName || ""}</p>
          {/*<p><strong>Mã Nhà xuất bản:</strong> {contract.publisherId}</p>*/}

          <p><strong>Thông tin liên hệ: </strong>{contract.publisher.contactInfo || "N/A"}</p>
          <p><strong>Tài khoản ngân hàng: </strong>{contract.publisher.bankAccount || "N/A"}</p>
          <Divider/>
          <p><strong>Phần trăm chia sẻ doanh thu: </strong><span>{contract.revenueSharePercentage}%</span></p>
          <p><strong>Ngày tạo: </strong>{new Date(contract.startDate).toLocaleDateString()}</p>
          <p><strong>Ngày bắt đầu: </strong>{new Date(contract.startDate).toLocaleDateString()}</p>
          <p><strong>Ngày kết thúc: </strong>{new Date(contract.endDate).toLocaleDateString()}</p>
          <p><strong>Trạng thái: </strong><span className={cn("font-semibold", {
            "text-gray-500": contract.status === 0,
            "text-yellow-500": contract.status === 1,
            "text-blue-500": contract.status === 2,
            "text-green-500": contract.status === 3,
            "text-red-500": contract.status === 4 || contract.status === 5,
          })}>{getStatusLabel(contract.status)}</span></p>

          <Show when={contract?.status === 1}>
            <div className="buttons">
              <button
                className="edit-btn"
                onClick={() => setShowRejectModal(true)}
                disabled={
                  contract?.status === 3 || // Đang kích hoạt
                  contract?.status === 2 || // Chưa bắt đầu
                  contract?.status === 5 || //Từ chối
                  isApproved ||
                  contract?.status === 2 // Nếu đã chấp thuận
                }
              >
                Từ chối
              </button>

              <button
                className="approve-btn"
                onClick={() => setShowConfirmModal(true)}
                disabled={
                  contract?.status === 3 || // Đang kích hoạt
                  contract?.status === 2 || // Chưa bắt đầu
                  isRejected ||
                  contract?.status === 5 // Nếu đã từ chối
                }
              >
                Chấp thuận
              </button>
            </div>
          </Show>

        </div>

        <div className="attachments">
          <h3>Tài liệu đính kèm:</h3>
          <div className="attachment-list">
            {contract.contractAttachments.$values.map((attachment, index) => (
              <a key={index} className="attachment-item" href={attachment.attachmentURL} target="_blank"
                 rel="noopener noreferrer">
                {/* <img src={attachment.attachmentURL || "placeholder.png"} alt="Preview" /> */}
                <div className="attachment-preview">
                  <p>
                    <FontAwesomeIcon icon={faPaperclip} size="1.9x"/>
                  </p>
                </div>
                <div className="doc-name">{attachment.name}</div>
                <div className="doc-date">Ngày tạo: {new Date(attachment.createdAt).toLocaleDateString()}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Books Table */}
        <div className="books-section">
          <h3>Áp dụng cho các sách:</h3>

          <Table.Container>
            <Table.Head columns={[
              'Hình ảnh',
              'Tiêu đề',
              'ISBN-10',
              'ISBN-13',
              'Hành động'
            ]}/>
            <Table.Body
              when={books && books.length > 0}
              fallback={
                <tr>
                  <td className="h-32 text-center" colSpan="100">
                    <div className="flex gap-2 justify-center items-center">
                      <p>No books found!</p>
                    </div>
                  </td>
                </tr>
              }
            >
              {books.map((book) => (
                <Table.Row key={book.id}>
                  <Table.Cell isFirstCell={true}>
                    <div className="w-20">
                      <Image
                        src={book.coverImage || "/empty-image.jpg"}
                        alt={book.title}
                        className="block overflow-hidden rounded-md shadow-md"
                        imageClassName="aspect-[3/4] object-cover w-full bg-white"
                        preview
                      />
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="min-w-36">
                      <Link
                        to={generatePath(routes.bookDetails, { bookId: book.id })}
                        className="min-w-full line-clamp-3 break-words hover:underline text-indigo-500 font-semibold mb-2"
                        title={book.title}
                      >
                        {book.title} ({book.publicationYear})
                      </Link>

                      <p className="min-w-full line-clamp-2 break-words italic" title={book.originalTitle}>
                        Tên gốc: <strong>{book.originalTitle || "N/A"}</strong>
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="min-w-28 max-w-64">
                      <p className="min-w-full line-clamp-2 break-words">
                        {book.isbn10 || "N/A"}
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="min-w-28 max-w-64">
                      <p className="min-w-full line-clamp-2 break-words">
                        {book.isbn13 || "N/A"}
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      to={generatePath(routes.bookDetails, { bookId: book.id })}
                      className="flex justify-center items-center gap-1 px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800"
                    >
                      Chi tiết
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Container>
        </div>


        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Bạn chắc chắn?</h3>
              <p>Tôi đã đọc lại văn bản cam kết ở trong tệp đính kèm và đồng ý toàn bộ nội dung trên, đồng thời ký, điểm
                chỉ vào văn bản cam kết này.</p>
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
    </>
  )
};

// Hàm để ánh xạ status thành tên
const getStatusLabel = (status) => {
  switch (status) {
    case 0:
      return "Bản nháp";
    case 1:
      return "Đang xử lý";
    case 2:
      return "Chưa bắt đầu";
    case 3:
      return "Đã kích hoạt";
    case 4:
      return "Hết hạn";
    case 5:
      return "Từ chối";
    default:
      return "Unknown";
  }
};

export default ContractDetail;
