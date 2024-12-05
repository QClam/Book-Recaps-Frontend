import { useEffect, useState } from 'react';
import './Billing.scss';
import { useLocation, useNavigate } from 'react-router-dom'; // Thêm useLocation
import { axiosInstance } from "../../../utils/axios";
import Show from "../../Show";
import { Image } from "primereact/image";
import { cn } from "../../../utils/cn";
import { routes } from "../../../routes";
import { useAuth } from "../../../contexts/Auth";
import { toast } from "react-toastify";

const Billing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [ subscriptions, setSubscriptions ] = useState([]);
  const [ error, setError ] = useState(null);

  // Xử lý kết quả thanh toán từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search); // Lấy các tham số từ URL
    const code = params.get('code');
    const status = params.get('status');

    if (code && status) {
      navigate(routes.billingResult, { state: { code, status } }); // Điều hướng tới /result với trạng thái thanh toán
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
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để tiếp tục.");
      navigate(routes.login, { state: { from: routes.billing } });
      return;
    }

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

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative flex justify-center mb-3">
          <Image
            src="/logo-transparent.png"
            alt="Logo"
            className="block overflow-hidden rounded-full w-16"
            imageClassName="aspect-square object-cover w-full"
          />
        </div>
        <h2 className="text-3xl font-bold text-center mb-8">Bắt đầu hành trình của bạn</h2>

        <div className="grid md:grid-cols-2 gap-8">

          {subscriptions.length > 0 ? (
            subscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white p-8 rounded-lg shadow-md relative">
                <Show when={subscription.duration === 365}>
                  <div
                    className="absolute top-0 right-0 bg-[#FF6F61] text-white px-4 py-1 rounded-bl-lg rounded-tr-lg font-semibold"
                  >
                    Phổ biến nhất
                  </div>
                </Show>
                <h3 className="text-lg font-semibold mb-4">{subscription.name}</h3>

                <div className="flex justify-between gap-3 items-center mb-8">
                  <div>
                    <div className="text-2xl font-bold flex gap-3">
                      <p className={cn({
                        "text-[#FF6F61]": subscription.duration === 365,
                        "text-4xl my-2": subscription.duration !== 365,
                      })}>
                        {subscription.price.toLocaleString('vi-VN')}₫
                      </p>
                      <Show when={subscription.duration === 365}>
                        <p className="line-through text-gray-400">
                          {(subscription.price + 400000).toLocaleString('vi-VN')}₫
                        </p>
                      </Show>
                    </div>
                    <Show when={subscription.duration === 365}>
                      <div className="bg-orange-600 rounded px-2 py-1 text-white text-xs font-semibold w-fit">
                        Tiết kiệm 400.000₫
                      </div>
                    </Show>
                  </div>
                  <div className="text-xl font-semibold">
                    <span>
                      {Number((Math.ceil(subscription.price / subscription.duration / 100) * 100).toFixed(0)).toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-sm"> / ngày</span>
                  </div>
                </div>

                <button
                  className="bg-green-500 text-white px-6 py-3 rounded-lg w-full font-semibold"
                  onClick={() => handlePayment(subscription.id)}
                >
                  Bắt đầu ngay
                </button>

                <ul className="mt-6 space-y-3">
                  {/*<li className="flex items-center">*/}
                  {/*  <span className="text-green-600 mr-2">&#10003;</span>*/}
                  {/*  <span>{subscription.description}</span>*/}
                  {/*</li>*/}
                  <li className="flex items-center">
                    <span className="text-green-600 text-lg mr-2">&#10003;</span>
                    <span>Truy cập tối đa <strong>{subscription.expectedViewsCount} bài viết premium</strong> khác nhau</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 text-lg mr-2">&#10003;</span>
                    <span>Thời gian sử dụng <strong>{subscription.duration} ngày</strong></span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 text-lg mr-2">&#10003;</span>
                    <span>Thoải mái chọn lựa 500+ bài viết premium.</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-600 text-lg mr-2">&#10003;</span>
                    <span>Đánh dấu & Ghi chú</span>
                  </li>
                </ul>
              </div>
            ))) : (
            <p>Không có gói đăng ký nào để hiển thị.</p>
          )}
        </div>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
};

export default Billing;
