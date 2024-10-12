import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import Sidebar from "./Components/Sidebar/Sidebar";
import ContentList from "./Components/Content/ContentList";
import Overview from "./Components/Overview/Overview";
import FeedbackContent from "./Components/Content/FeedbackContent";
import Review from "./Components/Review/Review";
import ReviewNote from "./Components/Review/ReviewNote";
import Login from "./Components/Auth/Login";
import UsersList from "./Components/Users/UsersList";
import ConfirmEmail from "./Components/Auth/ConfirmEmail";
import PrivateRoute from "./Components/Auth/PrivateRoute";

import "./App.css";
import axios from "axios";
import BookApi from "./Components/Book/Book";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/auth/confirm-email";

  const api = axios.create({
    baseURL: "https://160.25.80.100:7124/api",
  });
  
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    console.log("Interceptor đã được cài đặt");
  
    if (!refreshToken) {
      // Không có refresh_token, yêu cầu người dùng đăng nhập lại
      console.error("Không có refresh token, điều hướng về trang login");
      window.location.href = "/login";
      return;
    }
  
    try {
      console.log("Đang làm mới token...");
      const response = await axios.post("https://160.25.80.100:7124/api/refresh-token", {
        accessToken: localStorage.getItem("access_token"), // Có thể null
        refreshToken,
      });
  
      const { accessToken: newAccessToken } = response.data.message.token;
  
      // Lưu token mới
      localStorage.setItem("access_token", newAccessToken);
  
      console.log("Token đã được làm mới thành công:", newAccessToken);
  
      return newAccessToken;
    } catch (error) {
      console.error("Làm mới token thất bại:", error);
      // Xóa token và điều hướng đến trang login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      throw new Error("Làm mới token thất bại");
    }
  };
  
  
  api.interceptors.request.use(
    async (config) => {
      const accessToken = localStorage.getItem("access_token");
  
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
  
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  axios.interceptors.response.use(
    (response) => {
      // Nếu phản hồi thành công, trả về dữ liệu như bình thường
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
  
      // Kiểm tra xem lỗi có phải là 401 (Unauthorized)
      if (error.response.status === 500 && !originalRequest._retry) {
        console.log("Token hết hạn, đang gọi refreshAccessToken...");
  
        originalRequest._retry = true;
  
        try {
          // Gọi hàm refreshAccessToken
          const newAccessToken = await refreshAccessToken();
  
          console.log("Token đã được làm mới:", newAccessToken);
  
          // Cập nhật header của request với token mới
          axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
  
          // Thử gửi lại request với token mới
          return axios(originalRequest);
        } catch (refreshError) {
          console.error("Làm mới token thất bại:", refreshError);
          // Nếu làm mới token thất bại, điều hướng đến trang login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
  
      return Promise.reject(error);
    }
  );
  

  return (
    <main>
      {!isLoginPage && <Sidebar />}
      <Routes>
        <Route path="/" element={<PrivateRoute> <ContentList /> </PrivateRoute>} />
        <Route path="/content" element={<PrivateRoute> <ContentList /> </PrivateRoute>} />
        <Route path="/overview" element={<PrivateRoute> <Overview /> </PrivateRoute>} />
        <Route path="/feedback" element={<PrivateRoute> <FeedbackContent /> </PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
        <Route path="/users" element={<PrivateRoute> <UsersList /> </PrivateRoute>} />
        <Route path="/for-you" element={<PrivateRoute> <BookApi /> </PrivateRoute>} />
        <Route
          path="/review/content_version/:id"
          element={<PrivateRoute> <Review /> </PrivateRoute>} />
        <Route
          path="/note/content_version/:id"
          element={
            <PrivateRoute> <ReviewNote /> </PrivateRoute>
          }
        />
      </Routes>
    </main>
  );
}

function AppWrapper() {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <Router>
        <App />
      </Router>
    </GoogleReCaptchaProvider>
  );
}

export default AppWrapper;
