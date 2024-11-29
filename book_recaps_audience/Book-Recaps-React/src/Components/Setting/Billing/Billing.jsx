import { useEffect, useState } from 'react';
import './Billing.scss';
import { useLocation, useNavigate } from 'react-router-dom'; // Thêm useLocation
import { routes } from "../../../routes";
import { axiosInstance } from "../../../utils/axios";

const Billing = () => {
  const [ subscriptions, setSubscriptions ] = useState([]);
  const [ error, setError ] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin từ URL hiện tại

  // Xử lý kết quả thanh toán từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search); // Lấy các tham số từ URL
    const code = params.get('code');
    const status = params.get('status');

    if (code && status) {
      navigate('/result', { state: { code, status } }); // Điều hướng tới /result với trạng thái thanh toán
    }
  }, [ location, navigate ]);

  useEffect(() => {
    const fetchAllSubscriptionPackages = async () => {
      try {
        const response = await axiosInstance.get('/api/subscriptionpackages/getallpackages');

        const subscriptionData = response.data?.data?.$values;
        if (subscriptionData && Array.isArray(subscriptionData)) {
          setSubscriptions(subscriptionData);
        } else {
          setError("Không tìm thấy dữ liệu gói đăng ký.");
        }
      } catch (error) {
        setError("Không thể lấy dữ liệu gói đăng ký.");
        console.error("Lỗi khi lấy dữ liệu gói đăng ký:", error);
      }
    };

    fetchAllSubscriptionPackages();
  }, []);

  const handlePayment = async (subscriptionPackageId) => {
    try {
      const response = await axiosInstance.post(`/api/transaction/create-transaction/${subscriptionPackageId}`);

      if (response.data.success) {
        // Mở URL thanh toán trong một tab mới
        window.open(response.data.checkoutUrl, '_blank');
      } else {
        setError("Không thể tạo giao dịch. Vui lòng thử lại.");
      }
    } catch (error) {
      setError("Lỗi khi tạo giao dịch.");
      console.error("Lỗi khi tạo giao dịch:", error);
    }
  };

  // Hàm xử lý sự kiện nhấn vào logo
  const handleLogoClick = () => {
    navigate(routes.explore);
  };

  return (
    <div className="billing-container">
      <div className="logo-container">
        <img
          src="/logo-transparent.png"
          alt="Logo"
          className="logobr"
          onClick={handleLogoClick} // Xử lý sự kiện nhấn vào logo
        />
      </div>

      <h1>Bắt đầu dùng thử ngay</h1>
      <p>
        Nhận quyền truy cập đầy đủ vào BookRecaps. Bạn sẽ không bị tính phí cho đến khi kết thúc thời gian dùng thử miễn
        phí. Huỷ bất cứ lúc nào.
      </p>

      <div className="billing-options">
        {subscriptions.length > 0 ? (
          subscriptions.map((subscription) => (
            <div key={subscription.id} className="billing-card">
              <div className="billing-header">
                <div className="billing-title">
                  <i className="calendar-icon"></i>
                  <h2>{subscription.name}</h2>
                </div>
                <p className="price">{`${subscription.price.toLocaleString('vi-VN')}₫`}</p>

                <p className="billed">
                  {subscription.duration === 365 ? "Tính phí hàng năm" : "Tính phí hàng tháng"}
                </p>
              </div>
              <button
                className="start-trial-button annual"
                onClick={() => handlePayment(subscription.id)}
              >
                Bắt đầu dùng thử ngay
              </button>
              <ul className="features-list">
                <li>{subscription.description || "Không có mô tả."}</li>
                <li>{`Thời hạn: ${subscription.duration} ngày`}</li>
                <li>Đánh dấu & Ghi chú</li>
                <li>Nghe & Đọc tóm tắt sách</li>
              </ul>
            </div>
          ))
        ) : (
          <p>Không có gói đăng ký nào để hiển thị.</p>
        )}
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Billing;
