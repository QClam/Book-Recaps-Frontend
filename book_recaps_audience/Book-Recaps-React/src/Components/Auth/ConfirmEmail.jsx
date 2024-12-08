import { useEffect, useRef, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { routes } from "../../routes";
import { axiosInstance } from "../../utils/axios";
import Show from "../Show";

function ConfirmEmail() {
  const navigate = useNavigate();
  // const email = location.state?.email || "unknown@example.com";
  // const confirmationLink = location.state?.message || ""; // lấy link từ message đc truyền qua
  const [ loading, setLoading ] = useState(true);
  const [ message, setMessage ] = useState("");
  const [ isConfirmed, setIsConfirmed ] = useState(false);
  const [ countdown, setCountdown ] = useState(3);
  const [ searchParams ] = useSearchParams();
  const timerRef = useRef(null);

  useEffect(() => {
    const confirmEmail = async () => {
      const userId = searchParams.get('userId');
      const token = searchParams.get('token');

      if (!userId || !token) {
        setMessage('Link xác nhận không hợp lệ.');
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get('/api/confirm-email', {
          params: {
            userId,
            token,
          },
        });

        if (response.status === 200) {
          setMessage('Xác nhận email thành công!');
          setIsConfirmed(true);
        } else {
          setMessage('Xác nhận email thất bại. Vui lòng thử lại.');
        }
      } catch (error) {
        // Cải thiện thông báo lỗi dựa trên trạng thái
        if (error.response) {
          setMessage(`Xác nhận email thất bại. Lỗi: ${error.response.data.message || 'Vui lòng thử lại.'}`);
        } else {
          setMessage('Xác nhận email thất bại. Vui lòng kiểm tra kết nối.');
        }
        console.error('Error confirming email:', error);
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, []);

  useEffect(() => {
    if (isConfirmed && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    if (countdown === 0) {
      navigate(routes.login, { replace: true });
    }
  }, [ isConfirmed, countdown ]);

  return (
    <div className="container mx-auto max-w-screen-lg p-5">
      <div className="flex flex-col items-center">
        {loading ? (
          <>
            <InfinitySpin
              visible={true}
              width="200"
              color="#4fa94d"
              ariaLabel="infinity-spin-loading"
            />
            <p>Chúng tôi đang xác nhận Email {searchParams.get("email")}, vui lòng chờ trong giây lát...</p>
          </>
        ) : (
          <>
            <p>{message}</p>
            <Show when={isConfirmed}>
              <p className="mt-2">Chuyển hướng về trang đăng nhập sau <strong>{countdown} giây</strong>...</p>
            </Show>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmEmail;
