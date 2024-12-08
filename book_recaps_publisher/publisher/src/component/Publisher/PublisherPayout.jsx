import { useEffect, useState } from 'react';
import { generatePath, Link, useParams } from 'react-router-dom';
import "../Publisher/PublisherPayout.scss";
import defaultImage from "../../assets/empty-image.png";
import { axiosInstance } from "../../utils/axios";
import { routes } from "../../routes";

const PublisherPayout = () => {
  const { id } = useParams(); // Get the payout ID from the URL

  const [ payoutDetail, setPayoutDetail ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ detailedBooks, setDetailedBooks ] = useState([]);
  const [ isModalOpen, setModalOpen ] = useState(false);

  useEffect(() => {
    const fetchPayoutDetail = async () => {
      try {
        const response = await axiosInstance.get(`/api/PublisherPayout/getpayoutinfobyid/${id}`);
        const data = response.data;
        setPayoutDetail(data);

        // Fetch detailed book information for each book ID in the payout details
        const detailedBooksPromises = data?.data?.bookEarnings?.$values?.map(async (earning) => {
          const bookResponse = await axiosInstance.get(`/api/book/getbookbyid/${earning.bookId}`);
          const bookData = bookResponse.data;
          return { ...earning, ...bookData.data }; // Combine book data with earnings info
        });

        const detailedBooks = await Promise.all(detailedBooksPromises);
        setDetailedBooks(detailedBooks);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPayoutDetail();
  }, [ id ]);

  return (
    <div className="thanhtoanv1">
      {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
      {payoutDetail ? (
        <div>
          <div className="card-container">
            <div className="card-header">Chi Tiết Thanh Toán</div>
            <div className="payout-info">
              <div className="left">
                <p><strong>Tên Nhà Xuất Bản:</strong> {payoutDetail?.data?.publisher?.publisherName}</p>
                <p><strong>Thông Tin Liên Hệ:</strong> {payoutDetail?.data?.publisher?.contactInfo}</p>
                <p><strong>Số Tài Khoản Ngân Hàng:</strong> {payoutDetail?.data?.publisher?.bankAccount}</p>
                <p><strong>Mô Tả:</strong> {payoutDetail?.data?.description || "Không có mô tả"}</p>
                <p>
                  <strong>Minh chứng thanh toán:</strong>
                  <img
                    src={payoutDetail?.data?.imageURL || "Không có hình ảnh"}
                    className="small-image"
                    alt="Chi Tiết Thanh Toán"
                    onClick={() => setModalOpen(true)}
                  />
                </p>
              </div>

              <div className="right">
                <p><strong>Từ Ngày:</strong> {new Date(payoutDetail?.data?.fromDate).toLocaleDateString()}</p>
                <p><strong>Đến Ngày:</strong> {new Date(payoutDetail?.data?.toDate).toLocaleDateString()}</p>
                <p><strong>Tỷ Lệ Chia Lợi Nhuận:</strong> {payoutDetail?.data?.publisher?.revenueSharePercentage}%</p>
                <p><strong>Số Tiền:</strong> {new Intl.NumberFormat('vi-VN').format(payoutDetail?.data?.amount)} <span
                  className="currency-symbol">₫</span></p>
                <p>
                  <strong>Trạng Thái:</strong>{" "}
                  <span className={payoutDetail?.data?.status === 1 ? "paid" : "unpaid"}>
                      {payoutDetail?.data?.status === 1 ? "Đã Thanh Toán" : "Chưa Thanh Toán"}
                  </span>
                </p>
              </div>
            </div>

            {/* Modal hiển thị hình ảnh */}
            {isModalOpen && (
              <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                <div className="modal-content">
                  <img
                    src={payoutDetail?.data?.imageURL || "Không có hình ảnh"}
                    alt="Chi Tiết Thanh Toán"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bảng Doanh Thu Sách */}
          <div className="book-earnings">
            <h3>Doanh Thu Sách</h3>
            <table>
              <thead>
              <tr>
                <th>Tên Sách</th>
                <th>Hình Ảnh Bìa</th>
                <th>Số Tiền</th>
                <th>Từ Ngày</th>
                <th>Đến Ngày</th>
              </tr>
              </thead>
              <tbody>
              {detailedBooks?.map((book, index) => (
                <tr key={index}>
                  <td>
                    <Link
                      to={generatePath(routes.bookDetails, { bookId: book.bookId })}
                      className="text-blue-600 hover:underline hover:text-blue-700"
                      state={{
                        fromDate: book.fromDate,
                        toDate: book.toDate
                      }}>
                      {book.title}
                    </Link>
                  </td>
                  <td>
                    <img
                      src={book.coverImage || defaultImage}
                      alt={book.title}
                      width="50"
                    />
                  </td>

                  <td>
                    {new Intl.NumberFormat('vi-VN').format(book.earningAmount)} <span
                    className="currency-symbol">₫</span>
                  </td>
                  <td>{new Date(book.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(book.toDate).toLocaleDateString()}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p>Đang tải chi tiết thanh toán...</p>
      )}
    </div>
  );

};

export default PublisherPayout;
