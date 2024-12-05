import { useEffect, useState } from "react";
import "../SubcriptionHistory/SubcriptionHistory.scss";
import { axiosInstance } from "../../../utils/axios";
import { useAuth } from "../../../contexts/Auth";
import { Divider } from "primereact/divider";
import { BiPurchaseTag } from "react-icons/bi";
import { Link } from "react-router-dom";
import { routes } from "../../../routes";
import { Message } from "primereact/message";
import { TbExclamationCircle } from "react-icons/tb";

const SubscriptionHistory = () => {
  const [ subscriptionData, setSubscriptionData ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchSubscriptionHistory();
  }, []);

  const fetchSubscriptionHistory = async () => {
    try {
      const response = await axiosInstance.get(`/api/subscription/gethistorysubscription/${user.id}`);
      setSubscriptionData(response.data.data);
    } catch (err) {
      console.error("Error fetching subscription data:", err);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container mx-auto max-w-screen-xl p-5">
      <div className="subscription-history">

        {/* Hiển thị gói hiện tại */}
        {subscriptionData?.currentSubscription && (
          <>
            <h1 className="font-semibold text-2xl mb-6 text-center">Gói đang sử dụng</h1>
            <div className="current-subscription">
              <div className="subscription-details">
                <div className="flex gap-4 justify-start">
                  <div className="text-end">
                    <p>Tên gói:</p>
                    <p>Bắt đầu:</p>
                    <p>Có thể xem:</p>
                  </div>
                  <div className="flex-1">
                    <p><strong>{subscriptionData.currentSubscription.packageName}</strong></p>
                    <p>
                      <strong>{new Date(subscriptionData.currentSubscription.startDate).toLocaleDateString('vi-VN')}</strong>
                    </p>
                    <p><strong>{subscriptionData.currentSubscription.expectedViewsCount} bài viết Premium</strong></p>
                  </div>
                </div>
                <div className="flex gap-4 justify-start">
                  <div className="text-end">
                    <p>Giá:</p>
                    <p>Kết thúc:</p>
                    <p>Còn lại:</p>
                  </div>
                  <div className="flex-1">
                    <p><strong>{Number(subscriptionData.currentSubscription.price).toLocaleString("vi-VN")}₫</strong>
                    </p>
                    <p>
                      <strong>{new Date(subscriptionData.currentSubscription.endDate).toLocaleDateString('vi-VN')}</strong>
                    </p>
                    <p>
                      <strong><span
                        className="text-indigo-600">
                      {subscriptionData.currentSubscription.expectedViewsCount - subscriptionData.currentSubscription.actualViewsCount}
                        /{subscriptionData.currentSubscription.expectedViewsCount}</span>{' '}
                        bài viết Premium
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </>
        )}


        <Message
          severity="warn"
          content={
            <div className="flex items-start gap-2">
              <TbExclamationCircle size={24}/>
              <div>
                <p><strong>Lưu ý:</strong></p>
                <ul className="list-disc ml-4 text-sm">
                  <li>
                    Người dùng có thể mua và sở hữu nhiều gói subscription cùng lúc, mỗi gói có ngày bắt đầu và ngày
                    kết thúc riêng.
                  </li>
                  <li>
                    Hệ thống sẽ tự động kích hoạt gói có ngày bắt đầu và ngày kết thúc phù hợp với ngày hiện tại.
                  </li>
                  <li>
                    Nếu gói hiện tại hết lượt xem, hệ thống sẽ tự động chuyển sang gói khác (nếu có).
                  </li>
                </ul>
                <p></p>
              </div>
            </div>
          }
        />
        <Divider/>

        {/* Hiển thị lịch sử subscription */}
        <div className="flex justify-between items-center gap-4 my-4">
          <h2 className="font-semibold text-2xl">Lịch sử đăng ký gói</h2>
          <Link
            to={routes.billing}
            className="flex justify-center items-center gap-2 px-3 py-2 font-semibold bg-indigo-600 text-white text-sm rounded hover:bg-indigo-800"
          >
            <BiPurchaseTag size={17}/>
            <span>Mua gói mới</span>
          </Link>
        </div>
        {subscriptionData?.historySubscriptions?.$values.length > 0 ? (
          <table className="history-table">
            <thead>
            <tr className="text-sm">
              <th>Tên gói</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Giá tiền (VNĐ)</th>
              <th>
                <p>Có thể xem</p>
                <p className="text-xs italic w-max">(premium recaps)</p>
              </th>
              <th>
                <p>Đã xem</p>
                <p className="text-xs italic w-max">(premium recaps)</p>
              </th>
              <th>Trạng thái</th>
            </tr>
            </thead>
            <tbody>
            {subscriptionData.historySubscriptions.$values.map((history, index) => (
              <tr key={index}>
                <td>{history.packageName}</td>
                <td>{new Date(history.startDate).toLocaleDateString('vi-VN')}</td>
                <td>{new Date(history.endDate).toLocaleDateString('vi-VN')}</td>
                <td>{Number(history.price).toLocaleString('vi-VN')}</td>
                <td>{history.expectedViewsCount}</td>
                <td>{history.actualViewsCount}</td>
                <td className="text-sm">
                  {history.status === 0 ? (
                    <span className="text-green-600">Đang hoạt động</span>
                  ) : history.status === 1 ? (
                    <span className="text-red-600">Đã hết hạn</span>
                  ) : history.status === 2 ? (
                    <span className="text-yellow-600">Đang xử lý</span>
                  ) : (
                    <span className="text-gray-500">Chưa bắt đầu</span>
                  )}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 italic">
            Bạn chưa từng đăng ký gói.
          </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionHistory;
