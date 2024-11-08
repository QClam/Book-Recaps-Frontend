import React, { useState } from "react";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import "./Login.scss";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",

  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleRegisterClick = () => {
    setIsActive(true);
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
    console.log(value);
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

    if (!executeRecaptcha) {
      setError("reCAPTCHA chưa được khởi tạo");
      return;
    }

    try {

      const capcha = await executeRecaptcha("signup")

      const newUser = {
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        phoneNumber: registerForm.phoneNumber,
        captchaToken: capcha,
      };

      const response = await axios.post(
        "https://160.25.80.100:7124/api/register",
        newUser
      );
      console.log("Register Successfully", newUser);
      console.log("Link: ", response.data.message);
      navigate("/auth/confirm-email", {
        state: {
          email: registerForm.email,
          message: response.data.message,
        },
      });

      setRegisterForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
      });
      setError(null); // Reset error state
    } catch (error) {
      console.error("Error registering user:", error);
      setError("Đăng ký thất bại.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!executeRecaptcha) {
      setError("reCAPTCHA chưa được khởi tạo");
      return;
    }
  
    try {
      // Thực hiện reCAPTCHA
      const capcha = await executeRecaptcha("login");
  
      // Login request
      const response = await axios.post("https://160.25.80.100:7124/api/tokens", {
        email,
        password,
        captchaToken: capcha,
      });
  
      const { accessToken, refreshToken } = response.data.message.token;

      // Save the tokens if they exist
      if (accessToken && refreshToken) {
        localStorage.setItem("authToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        // console.log("AccessToken saved to localStorage:", accessToken);
        // console.log("RefreshToken saved to localStorage:", refreshToken);
      } else {
        console.error("Tokens not found in API response");
        setError("Không tìm thấy token trong phản hồi của API.");
      }
    
      navigate("/explore"); // Navigate to the home page after successful login
    } catch (error) {
      console.error("Error logging in:", error.response ? error.response.data : error.message);
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
    }
  };
  
  const forgetPasswordClick = () => {
    navigate("/forget-password");
  }


  return (
    <div className="login-page">
      <div className={`containerner ${isActive ? "active" : ""}`} id="container">
        <div className="form-container sign-up">
          <form onSubmit={handleSignUp}>
            <h1>Đăng ký</h1>
            {/* <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook"></i>
              </a>
            </div> */}
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
            <button type="submit">Đăng ký</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </form>
        </div>

        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Đăng nhập</h1>
            {/* <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook"></i>
              </a>
            </div> */}
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
            <button type="submit">Đăng nhập</button>
            <a style={{textDecoration: "none", cursor: "pointer"}} onClick={() => forgetPasswordClick()}>Forget password</a>
            {error && <p style={{ color: 'red' }}>{error}</p>}
           
   
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Chào mừng trở lại</h1>
              <p>
                Nhập thông tin cá nhân để sử dụng các chức năng của trang web
              </p>
              <button className="hidden" id="login" onClick={handleLoginClick}>
                Đăng nhập
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Xin chào</h1>
              <p>
                Đăng ký thông tin cá nhân để sử dụng các chức năng của trang web
              </p>
              <button
                className="hidden"
                id="register"
                onClick={handleRegisterClick}
              >
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
