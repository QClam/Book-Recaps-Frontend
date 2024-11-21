import React, { useState, useEffect } from 'react';  
import axios from 'axios';
import './Billing.scss';

const Billing = () => {
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);
  
  // Retrieve tokens from local storage
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchSubscriptionPackage = async () => {
      try {
        const response = await axios.get(
          'https://160.25.80.100:7124/api/subscriptionpackages/getpackagebyid/{id}', 
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Resolve references if any
        const resolvedData = resolveRefs(response.data?.data);
        setSubscription(resolvedData);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Handle token refresh if unauthorized
          await handleTokenRefresh();
          fetchSubscriptionPackage(); // Retry after refreshing token
        } else {
          setError(error.message);
          console.error("Error fetching subscription:", error);
        }
      }
    };

    const handleTokenRefresh = async () => {
      try {
        const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
          refreshToken,
        });

        // Update tokens in local storage
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;
        localStorage.setItem("authToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        console.log("Token refreshed successfully");
      } catch (error) {
        console.error("Error refreshing token:", error);
        setError("Session expired. Please log in again.");
      }
    };

    fetchSubscriptionPackage();
  }, [accessToken, refreshToken]);

  return (
    <div className="billing-container">
      <h1>Bắt đầu dùng thử ngay</h1>
      <p>
        Nhận quyền truy cập đầy đủ vào BookRecaps. Bạn sẽ không bị tính phí cho đến khi kết thúc thời gian dùng thử miễn phí. Huỷ bất cứ lúc nào.
      </p>

      <div className="billing-options">
        {/* Monthly Package */}
        <div className="billing-card">
          <div className="billing-header">
            <div className="billing-title">
              <i className="calendar-icon"></i>
              <h2>Hàng tháng</h2>
            </div>
            <p className="price">80.000/tháng</p>
            <p className="billed">Tính phí hàng tháng</p>
          </div>
          <button className="start-trial-button monthly">Bắt đầu dùng thử miễn phí</button>
          <ul className="features-list">
            <li>Hơn 100 cuốn sách</li>
            <li>Hơn 100 bài tóm tắt sách khác nhau</li>
            <li>Ứng dụng di động (iOS/Android)</li>
            <li>Đánh dấu & Ghi chú</li>
            <li>Kể chuyện bằng âm thanh</li>
          </ul>
        </div>

        {/* Annual Package (with fetched data) */}
        {subscription && (
          <div className="billing-card">
            <div className="billing-header">
              <div className="billing-title">
                <i className="calendar-icon"></i>
                <h2>{subscription.name}</h2>
              </div>
              <p className="price">{`${subscription.price}₫`}</p>
              <p className="billed">Tính phí hàng năm</p>
            </div>
            <button className="start-trial-button annual">Bắt đầu dùng thử miễn phí</button>
            <ul className="features-list">
              <li>{subscription.description}</li>
              <li>{`Thời hạn: ${subscription.duration} ngày`}</li>
              <li>Đánh dấu & Ghi chú</li>
              <li>Kể chuyện bằng âm thanh</li>
            </ul>
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Billing;

// Utility function to resolve circular references in JSON response
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
