// loginAction.js
import { axiosInstance, isRoleMatched, isValidToken } from "../../utils/axios";
import { jwtDecode } from "jwt-decode";

export async function loginAction({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const captchaToken = formData.get('captchaToken');

  if (!email || !password) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  if (!captchaToken) {
    return { error: "Lỗi captcha: Vui lòng thử lại sau vài giây" };
  }
  try {
    const response = await axiosInstance.post('/api/tokens', {
      email, password, captchaToken
    });

    const { accessToken } = response.data.message.token;
    const decoded = jwtDecode(accessToken);

    if (!isValidToken(decoded)) {
      return { error: "Token không hợp lệ" };
    }
    if (!isRoleMatched(decoded, "Contributor")) {
      return { error: "Vui lòng đăng nhập bằng tài khoản Contributor" };
    }

    return {
      user: {
        email: decoded.email,
        name: decoded.name,
        role: decoded[import.meta.env.VITE_CLAIMS_ROLE]
      },
      token: accessToken
    };

  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);

      if (error.response.data.message) {
        return { error: error.response.data.message };
      }
      throw error;
    } else if (error.request) {
      // The request was made but no response was received
      console.log(error.request);
      return { error: "Không nhận được phản hồi từ máy chủ" };
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
    return { error: "Đã xảy ra lỗi" };
  }
}
