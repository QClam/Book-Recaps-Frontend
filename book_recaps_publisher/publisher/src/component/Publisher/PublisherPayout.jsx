import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../Publisher/PublisherPayout.scss";
import AllBookValue from '../Dashboard/AllBookValue';
import defaultImage from "../../assets/empty-image.png";

const PublisherPayout = () => {
    const { id } = useParams(); // Get the payout ID from the URL
    const [payoutDetail, setPayoutDetail] = useState(null);
    const [error, setError] = useState(null);
    const [detailedBooks, setDetailedBooks] = useState([]);
    const navigate = useNavigate(); // Initialize navigate hook

    useEffect(() => {
        const fetchPayoutDetail = async () => {
            const accessToken = localStorage.getItem('authToken');
            try {
                const response = await fetch(`https://bookrecaps.cloud/api/PublisherPayout/getpayoutinfobyid/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch payout detail");
                }

                const data = await response.json();
                setPayoutDetail(data);

                // Fetch detailed book information for each book ID in the payout details
                const detailedBooksPromises = data?.data?.bookEarnings?.$values?.map(async (earning) => {
                    const bookResponse = await fetch(
                        `https://bookrecaps.cloud/api/book/getbookbyid/${earning.bookId}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    if (!bookResponse.ok) throw new Error(`Failed to fetch book details for ID: ${earning.bookId}`);
                    const bookData = await bookResponse.json();
                    return { ...earning, ...bookData.data }; // Combine book data with earnings info
                });

                const detailedBooks = await Promise.all(detailedBooksPromises);
                setDetailedBooks(detailedBooks);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchPayoutDetail();
    }, [id]);

    const handleBookClick = (bookId, earningAmount, fromDate, toDate) => {
        navigate(`/book-payout/${bookId}`, {
            state: { 
                earningAmount,
                fromDate,
                toDate,
            }, 
        });
    };
    

    return (
        <div className="thanhtoanv1">
            {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
            {payoutDetail ? (
                <div>
                    <h2>Chi Tiết Thanh Toán</h2>
                    <div className="payout-info">
                        <div className="left">
                            <p><strong>Tên Nhà Xuất Bản:</strong> {payoutDetail?.data?.publisher?.publisherName}</p>
                            <p><strong>Thông Tin Liên Hệ:</strong> {payoutDetail?.data?.publisher?.contactInfo}</p>
                            <p><strong>Số Tài Khoản Ngân Hàng:</strong> {payoutDetail?.data?.publisher?.bankAccount}</p>
                            <p><strong>Mô Tả:</strong> {payoutDetail?.data?.description || "Không có mô tả"}</p>
                            <p>
                                <strong>Hình Ảnh:</strong>  
                                <img 
                                    src={payoutDetail?.data?.imageURL || "Không có hình ảnh"} 
                                    className="small-image" 
                                    alt="Chi Tiết Thanh Toán"
                                />
                            </p>
                        </div>
    
                        <div className="right">
                            <p><strong>Từ Ngày:</strong> {new Date(payoutDetail?.data?.fromDate).toLocaleDateString()}</p>
                            <p><strong>Đến Ngày:</strong> {new Date(payoutDetail?.data?.toDate).toLocaleDateString()}</p>
                            <p><strong>Tỷ Lệ Chia Lợi Nhuận:</strong> {payoutDetail?.data?.publisher?.revenueSharePercentage}%</p>
                            <p><strong>Số Tiền:</strong> {new Intl.NumberFormat('vi-VN').format(payoutDetail?.data?.amount)} <span className="currency-symbol">₫</span></p>
                            {/* <p><strong>Trạng Thái:</strong> {payoutDetail?.data?.status === 1 ? "Đã Thanh Toán" : "Chưa Thanh Toán"}</p> */}
                            <p>
                            <strong>Trạng Thái:</strong>{" "}
                            <span className={payoutDetail?.data?.status === 1 ? "paid" : "unpaid"}>
                                {payoutDetail?.data?.status === 1 ? "Đã Thanh Toán" : "Chưa Thanh Toán"}
                            </span>
                            </p>

                        </div>
                    </div>
                     {/* Chart showing the earnings of the books */}
          <AllBookValue bookEarnings={detailedBooks} />

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
                                        <td 
                                            onClick={() => handleBookClick(
                                                book.bookId, 
                                                book.earningAmount, 
                                                book.fromDate, 
                                                book.toDate
                                            )} 
                                            style={{ cursor: 'pointer', color: 'blue' }}
                                        >
                                            {book.title}
                                        </td>
    
                                        {/* <td>
                                            <img src={book.coverImage} alt={book.title} width="50" />
                                        </td> */}
                                        <td>
                                        <img 
                                            src={book.coverImage || defaultImage} 
                                            alt={book.title} 
                                            width="50" 
                                        />
                                        </td>

                                        <td>
                                        {new Intl.NumberFormat('vi-VN').format(book.earningAmount)} <span className="currency-symbol">₫</span>
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
