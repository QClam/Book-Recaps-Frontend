import axios from "axios";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

function ConfirmEmail() {
  const location = useLocation();
  const email = location.state?.email || "unknown@example.com";
  const confirmationLink = location.state?.message || ""; // lấy link từ message đc truyền qua
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Lấy params từ URL
  //   const getQueryParams = () => {
  //     const params = new URLSearchParams(location.search);
  //     console.log("Link params: ", params);
  //     const userId = params.get('userId');
  //     const token = params.get('token');
  //     return { userId, token };
  //   };

  //   useEffect(() => {
  //     const confirmEmail = async () => {
  //       const { userId, token } = getQueryParams();
  //       if (!userId || !token) {
  //         setMessage('Link xác nhận không hợp lệ.');
  //         setLoading(false);
  //         return;
  //       }

  //       try {
  //         // Gửi yêu cầu xác nhận email tới API bằng phương thức GET
  //         const response = await axios.get('https://160.25.80.100:7124/api/confirm-email', {
  //           params: {
  //             userId, // Truyền userId từ URL
  //             token,  // Truyền token từ URL
  //           },
  //         });

  //         if (response.status === 200) {
  //           setMessage('Xác nhận email thành công!');
  //           setTimeout(() => {
  //             navigate('/login'); // Điều hướng về trang đăng nhập sau 3 giây
  //           }, 3000);
  //         } else {
  //           setMessage('Xác nhận email thất bại. Vui lòng thử lại.');
  //         }
  //       } catch (error) {
  //         // Cải thiện thông báo lỗi dựa trên trạng thái
  //         if (error.response) {
  //           setMessage(`Xác nhận email thất bại. Lỗi: ${error.response.data.message || 'Vui lòng thử lại.'}`);
  //         } else {
  //           setMessage('Xác nhận email thất bại. Vui lòng kiểm tra kết nối.');
  //         }
  //         console.error('Error confirming email:', error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     confirmEmail();
  //   }, [location, navigate]);

  const handleLinkClick = (e) => {
    e.preventDefault(); // Prevent default link action

    // Open the confirmation link in a new tab
    window.open(confirmationLink, "_blank");

    // After opening the link, wait for 3 seconds before showing SweetAlert
    setTimeout(() => {
      Swal.fire({
        title: "Email Confirmation",
        text: "Email đã xác nhận thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/login"); // Redirect after SweetAlert is confirmed
      });
    }, 3000);
  };

  return (
    <div style={{marginLeft: "10vw"}}>
      {loading ? (
        <div>
          <div className="center">
            <InfinitySpin
              visible={true}
              width="200"
              color="#4fa94d"
              ariaLabel="infinity-spin-loading"
            />
          </div>
          <div>
            <p>
              Chúng tôi đang xác nhận Email {email}, vui lòng chờ trong giây
              lát...
            </p>
            <p className="center">
              {confirmationLink ? (
                <a
                  href={confirmationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  Bấm vào đây để xác nhận Email
                </a>
              ) : (
                "Link not available"
              )}
            </p>{" "}
            {/* Hyperlink for confirmation */}
          </div>
        </div>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
}

export default ConfirmEmail;
