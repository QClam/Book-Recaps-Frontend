import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "../Publisher/PublisherPayout.scss";

const PublisherPayout = () => {
    const { id } = useParams(); // Get the payout ID from the URL
    const [payoutDetail, setPayoutDetail] = useState(null);
    const [error, setError] = useState(null);
    const [detailedBooks, setDetailedBooks] = useState([]);

    useEffect(() => {
        const fetchPayoutDetail = async () => {
            const accessToken = localStorage.getItem('authToken');
            try {
                const response = await fetch(`https://160.25.80.100:7124/api/PublisherPayout/getpayoutinfobyid/${id}`, {
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
                        `https://160.25.80.100:7124/api/book/getbookbyid/${earning.bookId}`,
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

    return (
        <div className="thanhtoanv1">
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {payoutDetail ? (
                <div>
                    <h2>Payout Detail</h2>
                    <div className="payout-info">
                        <div className="left">
                            <p><strong>Publisher Name:</strong> {payoutDetail?.data?.publisher?.publisherName}</p>
                            <p><strong>Contact Info:</strong> {payoutDetail?.data?.publisher?.contactInfo}</p>
                            <p><strong>Bank Account:</strong> {payoutDetail?.data?.publisher?.bankAccount}</p>
                            <p><strong>Description:</strong> {payoutDetail?.data?.description || "No description"}</p>
                        </div>

                        <div className="right">
                            <p><strong>From Date:</strong> {new Date(payoutDetail?.data?.fromDate).toLocaleDateString()}</p>
                            <p><strong>To Date:</strong> {new Date(payoutDetail?.data?.toDate).toLocaleDateString()}</p>
                            <p><strong>Revenue Share Percentage:</strong> {payoutDetail?.data?.publisher?.revenueSharePercentage}%</p>
                            {/* <p><strong>Earning:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payoutDetail?.data?.amount)}</p>
                             */}
                            <p><strong>Earning:</strong> {payoutDetail?.data?.amount} <span className="currency-symbol">₫</span></p>

                           


                        </div>
                    </div>

                    {/* Book Earnings Table */}
                    <div className="book-earnings">
                        <h3>Book Earnings</h3>
                        <table>
                            <thead>
                                <tr>
                                    {/* <th>Book ID</th> */}
                                    <th>Book Title</th>
                                    <th>Cover Image</th>

                                    <th>Earning Amount</th>
                                    <th>From Date</th>
                                    <th>To Date</th>
                                </tr>
                            </thead>
                            <tbody>
                            {detailedBooks?.map((book, index) => (
                                    <tr key={index}>
                                        <td>{book.title}</td>
                                        <td>
                                            <img src={book.coverImage} alt={book.title} width="50" />
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
                <p>Loading payout detail...</p>
            )}
        </div>
    );
};

export default PublisherPayout;
