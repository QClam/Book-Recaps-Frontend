// loginAction.js
import { axiosInstance, isRoleMatched, isValidToken } from "../../utils/axios";
import { jwtDecode } from "jwt-decode";
import { handleFetchError } from "../../utils/handleFetchError";

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

    const profileResponse = await axiosInstance.get("/api/personal/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      user: {
        email: decoded.email,
        name: profileResponse.data.fullName,
        role: "Contributor",
        id: decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER],
        profileData: profileResponse.data,
      },
      token: accessToken
    };

  } catch (error) {
    return handleFetchError(error);
  }
}
