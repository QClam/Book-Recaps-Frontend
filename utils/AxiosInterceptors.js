import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const api = axios.create({
  baseURL: "https://bookrecaps.cloud",
  timeout: 5000,
});


const refreshAccessToken = async () => {
  const navigation = useNavigation()
  const refreshToken = await AsyncStorage.getItem("refresh_token");

  if (!refreshToken) {
    console.error("Không có refresh token, điều hướng về trang login");
    navigation.navigate('Login');
    return;
  }

  try {
    console.log("Đang làm mới token...");
    const accessToken = await AsyncStorage.getItem("access_token");
    const response = await api.post("/refresh-token", {
      accessToken,
      refreshToken,
    });

    const { accessToken: newAccessToken } = response.data.message.token;

    // Lưu token mới
    await AsyncStorage.setItem("access_token", newAccessToken);

    console.log("Token đã được làm mới thành công:", newAccessToken);

    return newAccessToken;
  } catch (error) {
    console.error("Làm mới token thất bại:", error);
    // Xóa token và điều hướng đến trang login
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    // Điều hướng login
    throw new Error("Làm mới token thất bại");
  }
};



api.interceptors.request.use(
  async (config) => {
    const accessToken = await AsyncStorage.getItem("access_token");

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response; // Trả về response nếu thành công
  },
  async (error) => {
    const navigation = useNavigation()
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log("Token hết hạn, đang gọi refreshAccessToken...");

      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken(); // Thêm await

        console.log("Token đã được làm mới:", newAccessToken);

        // Cập nhật header cho request gốc
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Thử gửi lại request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Làm mới token thất bại:", refreshError);

        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("refresh_token");

        navigation.navigate('Login');
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);


export default api;