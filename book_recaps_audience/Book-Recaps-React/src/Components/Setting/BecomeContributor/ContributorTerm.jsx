import { useEffect, useState } from 'react';
import './ContributorTerm.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { axiosInstance } from "../../../utils/axios";
import { useAuth } from "../../../contexts/Auth";
import { Navigate } from "react-router-dom";
import { routes } from "../../../routes";

const ContributorTerm = () => {
  const [ formData, setFormData ] = useState({
    agreed: false,
    firstName: '',
    lastName: '',
    email: '',
    signature: ''
  });
  const [ submitted, setSubmitted ] = useState(false);
  const [ error, setError ] = useState(null);
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user.role === 'Contributor') {
      toast.error("Bạn đã là Contributor rồi.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.put('/api/self-update-role', { role: 'contributor' });
      console.log("API response:", response.data);
      setSubmitted(true);
      setUser({ ...user, role: 'Contributor' });
      toast.success("Chúc mừng! Bạn đã trở thành Contributor.", { position: "top-right" });
    } catch (error) {
      console.error("Error during submission:", error);
      setError("An error occurred. Please try again.");
      toast.error("Bạn đã trở thành Contributor rồi.", { position: "top-right" });
    }
  };

  if (!submitted && user.role === 'Contributor') {
    return <Navigate to={routes.index} replace={true}/>;
  }

  return (
    <div className="container mx-auto max-w-screen-xl p-5">
      <div className="terms-container">
        {submitted ? (
          <div className="welcome-message space-y-4 text-center">
            <img src="/logo-transparent.png" alt="Logo"/>
            <h1 className="text-lg font-bold text-green-600">
              Chúc mừng! Bạn đã trở thành Contributor.
            </h1>
            <p>Bây giờ bạn có thể tạo và gửi các bản tóm tắt sách để xuất bản trên nền tảng.</p>
            <p>Bắt đầu ngay bằng cách đăng nhập vào web Contributor.</p>
            <a
              href={import.meta.env.VITE_CONTRIBUTOR_ENDPOINT}
              className="inline-block px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              rel="noopener noreferrer"
            >
              Đăng nhập vào web Contributor
            </a>
          </div>
        ) : (
          <>
            <h1 className="terms-title">Điều Khoản và Điều Kiện</h1>
            <p className="terms-subtitle">Vui lòng đọc và chấp thuận điều khoản bên dưới</p>
            <hr className="terms-divider"/>

            {/* (Your Terms sections and form go here, as in your original code) */}
            <div className="terms-section">
              <h2>1. Giới Thiệu</h2>
              <p>Chào mừng bạn đến với BookRecaps! Bằng việc đăng ký trở thành cộng tác viên, bạn đồng ý tạo và gửi các
                bản tóm tắt sách chất lượng cao để xét duyệt và xuất bản trên nền tảng. Các điều khoản và điều kiện sau
                đây sẽ quy định trách nhiệm và quyền lợi của cộng tác viên.</p>
            </div>
            <div className="terms-section">
              <h2>2. Điều Kiện Tham Gia</h2>
              <p>Để trở thành cộng tác viên, bạn cần:</p>
              <ul>
                <li>Đủ 18 tuổi trở lên.</li>
                <li>Tuân thủ các nguyên tắc và tiêu chuẩn nội dung của nền tảng.</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>3. Hướng Dẫn Nộp Nội Dung</h2>
              <p>Khi gửi bản tóm tắt sách, bạn cam kết:</p>
              <ul>
                <li>Cung cấp nội dung gốc do bạn tạo ra và có quyền sở hữu hợp pháp.</li>
                <li>Đảm bảo nội dung đúng cấu trúc yêu cầu (ý chính, tiêu đề, hình ảnh nếu có, và âm thanh).</li>
                <li>Không sao chép, hoặc gửi nội dung có ngôn ngữ không phù hợp, vi phạm tiêu chuẩn cộng đồng.</li>
              </ul>
              <p><strong>3.1 Xét Duyệt Nội Dung</strong></p>
              <ul>
                <li>Tất cả bản tóm tắt sẽ được đội ngũ kiểm duyệt đánh giá về chất lượng, tính chính xác, và tuân thủ
                  quy định.
                </li>
                <li>Nội dung đạt yêu cầu sẽ được phê duyệt và có thể bắt đầu công khai trên nền tảng.</li>
                <li>Nội dung bị từ chối sẽ nhận phản hồi cụ thể và có thể gửi đơn yêu cầu xét duyệt lại.</li>
              </ul>
              <p><strong>3.2 Kiểm Tra Trùng Lặp</strong></p>
              <p>BookRecaps sẽ tiến hành kiểm tra trùng lặp nội dung. Bản tóm tắt trùng lặp quá nhiều với nội dung đã có
                sẽ bị từ chối.</p>
            </div>

            <div className="terms-section">
              <h2>4. Chính Sách Kiếm Tiền và Thanh Toán</h2>
              <ul>
                <li>Các bản tóm tắt được phê duyệt sẽ đủ điều kiện kiếm tiền dựa trên các chỉ số hiệu suất lượt xem
                  premium
                </li>
                <li>Thu nhập sẽ được tính toán và thanh toán hàng tháng. Số dư thanh toán tối thiểu có thể được áp dụng
                  để yêu cầu rút tiền.
                </li>
                <li>Cộng tác viên cần cung cấp thông tin thanh toán và chịu trách nhiệm với các khoản thuế liên quan
                  (nếu có).
                </li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>5. Bản Quyền và Quyền Sở Hữu</h2>
              <ul>
                <li>Cộng tác viên giữ quyền sở hữu với nội dung đã gửi.</li>
                <li>Bằng việc gửi nội dung, bạn cấp cho BookRecaps quyền không độc quyền để xuất bản, phân phối, và
                  quảng bá nội dung đó trên nền tảng.
                </li>
                <li>Bạn cam kết không gửi nội dung vi phạm bản quyền hoặc không có sự cho phép từ tác giả/nắm giữ bản
                  quyền.
                </li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>6. Tiêu Chuẩn Cộng Đồng</h2>
              <p>Cộng tác viên cần tuân thủ:</p>
              <ul>
                <li>Tôn trọng quyền sở hữu trí tuệ và luật bản quyền.</li>
                <li>Không gửi nội dung chứa ngôn ngữ tục tĩu, bạo lực hoặc nội dung phản cảm.</li>
                <li>Tương tác lịch sự và tuân thủ các nguyên tắc cộng đồng của nền tảng.</li>
              </ul>
            </div>

            <div className="terms-section">
              <h2>7. Tạm Dừng hoặc Chấm Dứt Tài Khoản</h2>
              <ul>
                <li>BookRecaps có quyền tạm dừng hoặc chấm dứt tài khoản cộng tác viên vi phạm các điều khoản này.</li>
                <li>Việc gửi nội dung chất lượng thấp, sao chép hoặc vi phạm nhiều lần sẽ dẫn đến đình chỉ tài khoản.
                </li>
              </ul>
            </div>


            <div className="terms-section">
              <h2>8. Thay Đổi Điều Khoản</h2>
              <p>BookRecaps có thể cập nhật các điều khoản này khi cần thiết. Chúng tôi sẽ thông báo khi có thay đổi và
                bạn đồng ý rằng việc tiếp tục tham gia đồng nghĩa với việc chấp nhận các điều khoản mới.</p>
            </div>

            <p><strong>Bằng việc nhấn “Đồng ý” và tiếp tục, bạn xác nhận đã đọc, hiểu và chấp nhận các điều khoản và
              điều kiện trên.</strong></p>

            <form className="terms-form" onSubmit={handleSubmit}>
              {/* Your form fields here */}
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="agree"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="agree">
                  Tôi đồng ý với các điều khoản và điều kiện trên
                </label>
              </div>

              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="submit-button">Đồng ý</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContributorTerm;

