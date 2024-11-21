import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "../Publisher/PublisherPayout.scss";

const PublisherPayout = () => {
    const { id } = useParams(); // Get the payout ID from the URL
    const [payoutDetail, setPayoutDetail] = useState(null);
    const [error, setError] = useState(null);

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
                            <p><strong>Amount:</strong> {payoutDetail?.data?.amount}</p>
                        </div>
                    </div>

                    {/* Book Earnings Table */}
                    <div className="book-earnings">
                        <h3>Book Earnings</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Book ID</th>
                                    <th>Earning Amount</th>
                                    <th>From Date</th>
                                    <th>To Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payoutDetail?.data?.bookEarnings?.$values?.map((earning, index) => (
                                    <tr key={index}>
                                        <td>{earning.bookId}</td>
                                        <td>{earning.earningAmount}</td>
                                        <td>{new Date(earning.fromDate).toLocaleDateString()}</td>
                                        <td>{new Date(earning.toDate).toLocaleDateString()}</td>
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
