import { useEffect, useState } from 'react';
import "../Publisher/Publisher.scss";
import { generatePath, Link } from 'react-router-dom';
import { axiosInstance } from "../../utils/axios";
import { useAuth } from "../../contexts/Auth";
import { routes } from "../../routes";
import Show from "../Show";

const FetchPublisherData = () => {
  const { user: { publisherData } } = useAuth();

  const [ payoutData, setPayoutData ] = useState(null); // Dữ liệu từ API lấy thông tin thanh toán
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const publisherId = publisherData?.id
        const payoutResponse = await axiosInstance.get(`/api/PublisherPayout/getlistpayoutinfobypublisherid/${publisherId}`,);

        const payoutData = payoutResponse.data;
        // console.log('Payout data:', payoutData);

        setPayoutData(payoutData?.data?.$values || []); // Lọc dữ liệu payout

      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      }
      setLoading(false)
    };

    fetchData();
  }, []);

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
      <Show when={loading}>
        <p>Đang tải dữ liệu doanh thu...</p>
      </Show>

      {payoutData && payoutData.length > 0 && (
        <div className="mt-6">
          <h2>Quyết toán</h2>
          <table>
            <thead>
            <tr>
              <th>Nhà Xuất Bản</th>
              <th>Thu nhập</th>
              <th>Trạng Thái</th>
              <th>Từ Ngày</th>
              <th>Đến Ngày</th>
              <th>Nội dung</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {payoutData.map((payout) => (
              <tr key={payout.id}>
                <td>{publisherData?.publisherName}</td>
                <td className="earnings">
                  {new Intl.NumberFormat('vi-VN').format(payout.totalEarnings || 0)} <span
                  className="currency-symbol">đ</span>
                </td>
                <td>{payout.status}</td>
                <td>{new Date(payout.fromDate).toLocaleDateString()}</td>
                <td>{new Date(payout.toDate).toLocaleDateString()}</td>
                <td>{payout.description}</td>
                <td className="chitiet">
                  <Link
                    to={generatePath(routes.payoutDetails, { id: payout.payoutId })}
                    className="small-button"
                  >
                    Chi&nbsp;Tiết
                  </Link>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

};

export default FetchPublisherData;
