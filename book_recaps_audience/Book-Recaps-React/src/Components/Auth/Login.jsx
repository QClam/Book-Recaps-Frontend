import { useState } from "react";
import "./Login.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/Auth";
import { jwtDecode } from "jwt-decode";
import { axiosInstance, isRoleMatched, isValidToken } from "../../utils/axios";
import { routes } from "../../routes";
import { toast } from "react-toastify";
import { cn } from "../../utils/cn";
import { handleFetchError } from "../../utils/handleFetchError";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [ isActive, setIsActive ] = useState(location.state?.isRegister || false);

  const [ registerForm, setRegisterForm ] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",

  });
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ error, setError ] = useState(null);

  const [ submitting, setSubmitting ] = useState(false);

  const handleRegisterClick = () => {
    setIsActive(true);
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
  };

  const validateForm = () => {
    const fullNameRegex = /^[a-zA-ZÀ-ỹ\s]+$/; // Chỉ chấp nhận chữ cái và khoảng trắng
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Định dạng email hợp lệ
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Mật khẩu chứa ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, và 1 ký tự đặc biệt
    const phoneRegex = /^\d{10,11}$/; // Số điện thoại gồm 10 hoặc 11 chữ số

    if (!fullNameRegex.test(registerForm.fullName)) {
      setError("Họ và tên không hợp lệ.");
      return false;
    }

    if (!emailRegex.test(registerForm.email)) {
      setError("Email không hợp lệ.");
      return false;
    }

    if (!passwordRegex.test(registerForm.password)) {
      setError("Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
      return false;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return false;
    }

    if (!phoneRegex.test(registerForm.phoneNumber)) {
      setError("Số điện thoại không hợp lệ.");
      return false;
    }

    setError(null); // Không có lỗi
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Nếu form không hợp lệ, dừng lại
    }

    try {
      const newUser = {
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        phoneNumber: registerForm.phoneNumber,
        captchaToken: "string",
      };

      setSubmitting(true);

      await axiosInstance.post("/api/register", newUser);

      toast.success("Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.");

      setRegisterForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
      });
      setError(null); // Reset error state
    } catch (error) {
      const err = handleFetchError(error);
      toast.error(err.error);
      setError(err.error);
    }
    setSubmitting(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      // Login request
      const response = await axiosInstance.post("/api/tokens", {
        email,
        password,
        captchaToken: "string",
      });

      const { accessToken, refreshToken } = response.data.message.token;

      // Save the tokens if they exist
      if (accessToken && refreshToken) {
        // Fetch the user's profile to check if they have completed onboarding
        const profileResponse = await axiosInstance.get("/api/personal/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const decoded = jwtDecode(accessToken)
        const userId = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]

        if (
          profileResponse.data &&
          isValidToken(decoded) &&
          (isRoleMatched(decoded, "Contributor") || isRoleMatched(decoded, "Customer")) &&
          profileResponse.data.id === userId
        ) {
          login({
            email: decoded.email,
            name: profileResponse.data.fullName,
            id: userId,
            role: isRoleMatched(decoded, "Contributor") ? "Contributor" : "Customer",
            isOnboarded: profileResponse.data.isOnboarded,
            profileData: profileResponse.data,
          }, accessToken);
        } else {
          setError("Vui lòng đăng nhập bằng tài khoản Contributor hoặc Audience.");
        }
      } else {
        console.error("Tokens not found in API response");
        setError("Không tìm thấy token trong phản hồi của API.");
      }
    } catch (error) {
      const err = handleFetchError(error);
      toast.error(err.error);
      setError(err.error);
    }

    setSubmitting(false);
  };

  const forgetPasswordClick = () => {
    navigate(routes.forgetPassword);
  }

  return (
    <div className="login-page">
      <div className={`containerner ${isActive ? "active" : ""}`} id="container">
        <div className="form-container sign-up">
          <form onSubmit={handleSignUp}>
            <h1>Đăng ký</h1>
            <span>hoặc sử dụng email để đăng ký</span>
            <input
              required
              type="text"
              placeholder="Họ và Tên"
              name="fullName"
              value={registerForm.fullName}
              onChange={handleInputChange}
            />
            <input
              required
              type="email"
              placeholder="Email"
              name="email"
              value={registerForm.email}
              onChange={handleInputChange}
            />
            <input
              required
              type="password"
              placeholder="Mật khẩu"
              name="password"
              value={registerForm.password}
              onChange={handleInputChange}
            />
            <input
              required
              type="password"
              name="confirmPassword"
              placeholder="Xác minh Mật khẩu"
              value={registerForm.confirmPassword}
              onChange={handleInputChange}
            />
            <input
              required
              type="text"
              name="phoneNumber"
              placeholder="Số điện thoại"
              value={registerForm.phoneNumber}
              onChange={handleInputChange}
            />
            <button
              type="submit"
              disabled={submitting}
              className={cn("disabled:cursor-default disabled:opacity-70", {
                "disabled:cursor-progress": submitting,
              })}
            >
              {submitting ? "Đang xử lý..." : "Đăng ký"}
            </button>
            {error && <p className="text-red-500 text-center px-8">{error}</p>}
          </form>
        </div>

        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Đăng nhập</h1>
            <span>hoặc sử dụng email để đăng nhập</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Tài khoản"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mật khẩu"
            />
            <button
              type="submit"
              disabled={submitting}
              className={cn("disabled:cursor-default disabled:opacity-70", {
                "disabled:cursor-progress": submitting,
              })}
            >
              {submitting ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            <a style={{ textDecoration: "none", cursor: "pointer" }} onClick={() => forgetPasswordClick()}>Forget
              password</a>
            {error && <p className="text-red-500 text-center px-8">{error}</p>}
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Chào mừng trở lại</h1>
              <p>
                Nhập thông tin cá nhân để sử dụng các chức năng của trang web
              </p>
              <button id="login" onClick={handleLoginClick} disabled={submitting}>
                Đăng nhập
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Xin chào</h1>
              <p>
                Đăng ký thông tin cá nhân để sử dụng các chức năng của trang web
              </p>
              <button id="register" onClick={handleRegisterClick} disabled={submitting}>
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
