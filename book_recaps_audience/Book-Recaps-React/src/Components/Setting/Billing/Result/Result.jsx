import React, { useEffect, useState } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import '../Result/Result.scss';
import axios from 'axios';
import { routes } from "../../../../routes";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState({
    code: null,
    id: null,
    cancel: null,
    status: null,
    orderCode: null,
  });
  const [userName, setUserName] = useState('');
  const [iconType, setIconType] = useState('');
  const [error, setError] = useState(null);

  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const id = params.get('id');
    const cancel = params.get('cancel') === 'true';
    const status = params.get('status');
    const orderCode = params.get('orderCode');
    
    setPaymentResult({ code, id, cancel, status, orderCode });
    setIconType(status === 'PAID' && code === '00' && !cancel ? 'success' : 'fail');


    const fetchUserData = async () => {
      try {
        const response = await axios.get('https://bookrecaps.cloud/api/personal/profile', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        setUserName(response.data.fullName || 'User');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchUserData();
        } else {
          console.error('Failed to fetch user data:', error);
          setError("Không thể lấy thông tin người dùng.");
        }
      }
    };

    fetchUserData();
  }, [location.search, accessToken]);

  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://bookrecaps.cloud/api/tokens/refresh", {
        refreshToken,
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      console.log("Token đã được làm mới thành công");
    } catch (error) {
      console.error("Lỗi khi làm mới token:", error);
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  };

  const renderMessage = () => {
    if (paymentResult.cancel) {
      return (
        <div className="cancel-message">
          <h1>Payment Failed</h1>
          <p>Order Code: {paymentResult.orderCode}</p>
        </div>
      );
    } else if (paymentResult.status === 'PAID' && paymentResult.code === '00') {
      return (
        <div className="success-message">
          {/* <div className={`icon ${iconType}`}>
            {iconType === 'success' ? (
              <span className="checkmark">✓</span>
            ) : (
              <span className="x-icon">✗</span>
            )}
          </div> */}
          <h1>{userName}</h1>
          <h2>Payment Successfully Completed</h2>
        </div>
      );
    } else {
      return (
        <div className="error-message">
          {/* <div className={`icon ${iconType}`}>
          {iconType === 'success' ? (
  <span className="checkmark">✓</span>
) : (
  <span className="x-icon">✗</span>
)}

          </div> */}
          <h1>Payment Failed</h1>
          <p>Transaction was not successful or has been canceled. Please try again.</p>
          <p>Order Code: {paymentResult.orderCode}</p>
        </div>
      );
    }
  };

  return (
    <div className="payment-result-container">
      <div className="icon-container">
        {iconType === 'success' ? (
          <div className="icon success">
            <span className="checkmark">✓</span>
          </div>
        ) : (
          <div className="icon fail">
            <span className="x-icon">✗</span>
          </div>
        )}
      </div>
      {renderMessage()}
      <div className="payment-details">
        <div className="details-label">
          <p>Transaction ID</p>
        </div>
        <div className="details-value">
          <p>{paymentResult.id}</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="button-group">
        <button className="explore-button" onClick={() => navigate(routes.explore)}>Explore</button>
        <button className="try-again-button" onClick={() => navigate(routes.billing)}>Try Again</button>
      </div>
    </div>
  );
};

export default Result;
