import axios from "axios";

const api = axios.create({
  baseURL: "https://bookrecaps.cloud",
});

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    // Không có refresh_token, yêu cầu người dùng đăng nhập lại
    console.error("Không có refresh token, điều hướng về trang login");
    window.location.href = "/login";
    return;
  }

  try {
    console.log("Đang làm mới token...");
    const response = await api.post("/refresh-token", {
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

export default api ;
