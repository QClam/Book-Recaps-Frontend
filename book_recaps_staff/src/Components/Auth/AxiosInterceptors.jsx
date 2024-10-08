import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Hàm giải mã và kiểm tra thời gian hết hạn của token
const isTokenExpired = (token) => {
  if (!token) return true;

  const decoded = jwtDecode(token);
  const currentTime = Date.now() / 1000;

  return decoded.exp < currentTime; // Nếu exp nhỏ hơn thời gian hiện tại, token đã hết hạn
};

// Hàm nhận access và refresh token từ localStorage
const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

// Hàm lưu access và refresh token
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

// Cài đặt axios interceptors để kiểm tra và refresh token nếu cần
const setupAxiosInterceptors = (navigate) => {
  axios.interceptors.request.use(
    async (config) => {
      let token = getAccessToken();

      if (token && isTokenExpired(token)) {
        try {
          const refreshToken = getRefreshToken();
          const response = await axios.post("https://160.25.80.100:7124/api/refresh-token", {
            accessToken: token,
            refreshToken: refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          setTokens(newAccessToken, newRefreshToken);

          token = newAccessToken; // Cập nhật token mới
          console.log("New Refresh Token: ", newRefreshToken);
          console.log("Token refreshed ");
          
        } catch (error) {
          console.error("Refresh token expired", error);
          navigate("/login");
        }
      }

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (error.response.status === 401) {
        navigate("/login");
      }

      return Promise.reject(error);
    }
  );
};

export { setupAxiosInterceptors };
