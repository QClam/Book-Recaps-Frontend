import React, { useEffect, useState } from 'react';
import "../Publisher/Publisher.scss";
import { useNavigate } from 'react-router-dom';
import ReactDOM from "react-dom";

const FetchPublisherData = () => {
    const [profile, setProfile] = useState(null); // Dữ liệu từ API đầu tiên
    const [publisherData, setPublisherData] = useState(null); // Dữ liệu từ API thứ hai
    const [payoutData, setPayoutData] = useState(null); // Dữ liệu từ API lấy thông tin thanh toán
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isImageLarge, setIsImageLarge] = useState(false); // state để lưu trạng thái ảnh có lớn hay không

    const handleImageClick = () => {
        setIsImageLarge(!isImageLarge); // Toggle trạng thái khi click vào ảnh
    };


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

                // Gọi thêm API `getpayoutinfobyid` để lấy `imageURL`
                const enrichedPayoutData = await Promise.all(
                    payoutData?.data?.$values.map(async (payout) => {
                        const payoutDetailResponse = await fetch(
                            `https://bookrecaps.cloud/api/PublisherPayout/getpayoutinfobyid/${payout.payoutId}`,
                            {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${accessToken}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        if (!payoutDetailResponse.ok) {
                            console.warn(`Failed to fetch payout detail for ID: ${payout.payoutId}`);
                            return { ...payout, imageURL: null };
                        }

                        const payoutDetail = await payoutDetailResponse.json();
                        return { ...payout, imageURL: payoutDetail.data.imageURL };
                    })
                );

                // Cập nhật state
                setProfile(profileData);
                setPublisherData(publisherData);
                setPayoutData(payoutData?.data?.$values || []); // Lọc dữ liệu payout
                setPayoutData(enrichedPayoutData);

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
            <h2>Thông tin Nhà Xuất Bản</h2>
            {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
    
            {publisherData ? (
                <div>
                    <p><strong>Tên Nhà Xuất Bản:</strong> {publisherData.publisherName}</p>
                    <p><strong>Thông Tin Liên Hệ:</strong> {publisherData.contactInfo}</p>
                    <p><strong>Số Tài Khoản Ngân Hàng:</strong> {publisherData.bankAccount}</p>
                </div>
            ) : (
                <p>Đang tải dữ liệu nhà xuất bản...</p>
            )}
    
            {payoutData && payoutData.length > 0 ? (
                <div>
                    <h2>Doanh Thu</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Nhà Xuất Bản</th> {/* Cột Mới */}
                                <th>Tỷ Lệ Chia Lợi Nhuận</th> {/* Cột Mới */}
                                <th>Hình Ảnh</th>
                                <th>Mô Tả</th>
                                <th>Thu nhập</th>
                                <th>Trạng Thái</th>
                                <th>Từ Ngày</th>
                                <th>Đến Ngày</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payoutData.map((payout) => (
                                <tr key={payout.id}>
                                    <td>{publisherData?.publisherName}</td> {/* Hiển Thị Tên Nhà Xuất Bản */}
                                    <td>{publisherData?.revenueSharePercentage}%</td> {/* Hiển Thị Tỷ Lệ Chia Lợi Nhuận */}
                                    <td>
                                    <img
                                src={payout.imageURL}
                                alt="Doanh Thu"
                                className={isImageLarge ? "large-image" : "small-image"}
                                style={{ cursor: 'pointer' }}
                                onClick={handleImageClick} // Khi bấm vào sẽ mở hoặc thu nhỏ ảnh
                                    />
                                    </td>
    
                                    <td>{payout.description}</td>
                                    <td className="earnings">
                                        {new Intl.NumberFormat('vi-VN').format(payout.totalEarnings)} <span className="currency-symbol">₫</span>
                                    </td>

                                    <td>{payout.status}</td>
                                    <td>{new Date(payout.fromDate).toLocaleDateString()}</td>
                                    <td>{new Date(payout.toDate).toLocaleDateString()}</td>
                                    <td>
                                        <button onClick={() => handleDetailClick(payout.payoutId)}>Chi Tiết</button>
                                    </td>                                   
                                </tr>
                                
                            ))}
                            
                        </tbody>
                    </table>
      
                </div>
            ) : (
                <p>Đang tải dữ liệu doanh thu...</p>
            )}
        </div>
    );
    
};

export default FetchPublisherData;
