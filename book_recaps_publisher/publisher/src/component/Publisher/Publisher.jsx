import React, { useEffect, useState } from 'react';
import "../Publisher/Publisher.scss";
import { useNavigate } from 'react-router-dom';

const FetchPublisherData = () => {
    const [profile, setProfile] = useState(null); // Dữ liệu từ API đầu tiên
    const [publisherData, setPublisherData] = useState(null); // Dữ liệu từ API thứ hai
    const [payoutData, setPayoutData] = useState(null); // Dữ liệu từ API lấy thông tin thanh toán
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const accessToken = localStorage.getItem('authToken');
            try {
                // Gọi API đầu tiên để lấy `id`
                const profileResponse = await fetch('https://bookrecaps.cloud/api/personal/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!profileResponse.ok) {
                    throw new Error("Failed to fetch profile data");
                }

                const profileData = await profileResponse.json();
                console.log('Profile data:', profileData);

                // Lấy `id` từ response API đầu tiên
                const profileId = profileData?.id;
                if (!profileId) {
                    throw new Error("Profile ID not found");
                }

                // Gọi API thứ hai với `id` để lấy dữ liệu nhà xuất bản
                const publisherResponse = await fetch(
                    `https://bookrecaps.cloud/api/publisher/getbypublisheruser/${profileId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!publisherResponse.ok) {
                    throw new Error("Failed to fetch publisher data");
                }

                const publisherData = await publisherResponse.json();
                console.log('Publisher data:', publisherData);

                // Lấy `publisherId` từ dữ liệu nhà xuất bản
                const publisherId = publisherData?.id;
                if (!publisherId) {
                    throw new Error("Publisher ID not found");
                }

                // Gọi API để lấy thông tin thanh toán của nhà xuất bản
                const payoutResponse = await fetch(
                    `https://bookrecaps.cloud/api/PublisherPayout/getlistpayoutinfobypublisherid/${publisherId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!payoutResponse.ok) {
                    throw new Error("Failed to fetch payout data");
                }

                const payoutData = await payoutResponse.json();
                console.log('Payout data:', payoutData);

                // Cập nhật state
                setProfile(profileData);
                setPublisherData(publisherData);
                setPayoutData(payoutData?.data?.$values || []); // Lọc dữ liệu payout
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            }
        };

        fetchData();
    }, []);
    const handleDetailClick = (id) => {
        // Navigate to the detail page with the selected payout ID
        navigate(`/publisher-payout-detail/${id}`);
    };


    return (
        <div className="publisherinfo">
            <h2>Thông tin Nhà xuất bản</h2>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            {publisherData ? (
                <div>
                    <p><strong>Publisher Name:</strong> {publisherData.publisherName}</p>
                    {/* <p><strong>Revenue Share Percentage:</strong> {publisherData.revenueSharePercentage}%</p> */}
                    <p><strong>Contact Info:</strong> {publisherData.contactInfo}</p>
                    <p><strong>Bank Account:</strong> {publisherData.bankAccount}</p>
                </div>
            ) : (
                <p>Loading publisher data...</p>
            )}

            {payoutData && payoutData.length > 0 ? (
                <div>
                    <h2>Doanh thu</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Publisher Name</th> {/* New Column */}
                                <th>Revenue Share Percentage</th> {/* New Column */}
                                <th>Image</th>
                                <th>Description</th>
                                <th>Earning</th>
                                <th>Status</th>
                                <th>From Date</th>
                                <th>To Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payoutData.map((payout) => (
                                <tr key={payout.id}>
                                    <td>{publisherData?.publisherName}</td> {/* Display Publisher Name */}
                                    <td>{publisherData?.revenueSharePercentage}%</td> {/* Display Revenue Share Percentage */}
                                    <td>
                                        <img
                                            src={payout.imageURL}
                                            alt="Payout"
                                            style={{ width: '50px', height: '50px' }}
                                        />
                                    </td>
                                    <td>{payout.description}</td>
                                    <td>
                                    {new Intl.NumberFormat('vi-VN').format(payout.totalEarnings)} <span className="currency-symbol">₫</span>
                                    </td>
                                    <td>{payout.status}</td>
                                    <td>{new Date(payout.fromDate).toLocaleDateString()}</td>
                                    <td>{new Date(payout.toDate).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => handleDetailClick(payout.payoutId)}>Detail</button>
                                    </td>


                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>Loading payout data...</p>
            )}
        </div>
    );
};

export default FetchPublisherData;
