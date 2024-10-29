import axios from 'axios';
import React, { useState } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useNavigate } from 'react-router-dom';

function ForgetPassword() {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const [registerForm, setRegisterForm] = useState({
    Email: "",
    NewPassword: "",
    ConfirmPassword: "",
  });
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleRegisterClick = () => {
    setIsActive(true);
    setRegisterForm({ ...registerForm, email }); // Điền email vào form đặt lại mật khẩu
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
    setError(null);
    console.log(value);
  };

  const validateForm = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Định dạng email hợp lệ
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Mật khẩu chứa ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, và 1 ký tự đặc biệt

    if (!emailRegex.test(registerForm.email)) {
      setError("Email không hợp lệ.");
      return false;
    }

    if (!passwordRegex.test(registerForm.NewPassword)) {
      setError(
        "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return false;
    }

    if (registerForm.NewPassword !== registerForm.ConfirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleForgetPassword = async (e) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      setError("reCAPTCHA chưa được khởi tạo");
      return;
    }

    try {
      // Thực hiện reCAPTCHA
      const captchaToken = await executeRecaptcha("reset_password");

      const params = { email: email, captchaToken: captchaToken };
      // axios.post(url, body, params), trong đó body không có gì cả nên truyền null
      const response = await axios.post(
        "https://160.25.80.100:7124/api/forget-password", null, { params },
        {
          headers: {
            'Content-Type': 'application/json'
          },
        }

      );
      const resetToken = response.data.message;
      localStorage.setItem("reset_token", resetToken);
      localStorage.setItem("reset_email", email)
      console.log("Gửi Email Thành Công");
      handleRegisterClick();
    } catch (error) {
      console.error("Error sending forget password request:", error.response?.data || error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Nếu form không hợp lệ, dừng lại
    }

    if (!executeRecaptcha) {
      setError("reCAPTCHA chưa được khởi tạo");
      return;
    }

    try {
      const captchaToken = await executeRecaptcha("signup");
      const resetToken = localStorage.getItem("reset_token");
      const resetEmail = localStorage.getItem("reset_email");

      const params = { 
        Email: resetEmail, 
        Token: resetToken, 
        NewPassword: registerForm.NewPassword, 
        ConfirmPassword: registerForm.ConfirmPassword, 
        captchaToken: captchaToken 
      };

      const response = await axios.post(
        "https://160.25.80.100:7124/api/reset-password", null , { params },
        {
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );
      console.log("Reset Password Successfully", params);
      navigate("/login");

      setRegisterForm({
        email: "",
        NewPassword: "",
        ConfirmPassword: "",
      });
      setError(null);
    } catch (error) {
      // Bắt lỗi và back-end trả về
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message
      ) {
        // Kiểm tra thông báo lỗi
        setError("Email đã tồn tại, vui lòng sử dụng Email khác.");
      } else {
        console.error("Error sending forget password request:", error.response?.data || error.message);
        setError("Đăng ký thất bại.");
      }
    }
  };

  const loginClick = () => {
    navigate("/login")
  }

  return (
    <div className="login-page">
      <div className={`container ${isActive ? "active" : ""}`} id="container">
        <div className="form-container sign-up">
          <form onSubmit={handleResetPassword}>
            <h1 style={{ textAlign: "center" }}>Tạo mới mật khẩu</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook"></i>
              </a>
            </div>
            <span>nhập mật khẩu mới ở đây</span>
            <input
              required
              type="email"
              placeholder="Email"
              name="Email"
              value={localStorage.getItem("reset_email") || registerForm.Email}
              onChange={handleInputChange}
              onFocus={() => setError(null)}
              disabled
            />
            <input
              required
              type="password"
              placeholder="Mật khẩu mới"
              name="NewPassword"
              value={registerForm.NewPassword}
              onChange={handleInputChange}
              onFocus={() => setError(null)}
            />
            <input
              required
              type="password"
              name="ConfirmPassword"
              placeholder="Xác minh Mật khẩu mới"
              value={registerForm.ConfirmPassword}
              onChange={handleInputChange}
              onFocus={() => setError(null)}
            />
            <button type="submit">Gửi</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </div>

        <div className="form-container sign-in">
          <form onSubmit={handleForgetPassword}>
            <h1>Quên Mật Khẩu</h1>
            {/* <div className="social-icons">
                <a href="#" className="icon">
                  <i className="fa-brands fa-google"></i>
                </a>
                <a href="#" className="icon">
                  <i className="fa-brands fa-facebook"></i>
                </a>
              </div> */}
            <br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email dùng để đăng nhập"
              onFocus={() => setError(null)}
            />
            <br />
            <button type="submit">Gửi</button>
            <a style={{ textDecoration: "none", cursor: "pointer" }} onClick={() => loginClick()}>Quay trở lại đăng nhập</a>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Hãy nhập mật khẩu mới của bạn</h1>
              <button
                className="hidden"
                id="login"
                onClick={handleLoginClick}
                onFocus={() => setError(null)}
              >
                Đăng nhập
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Để tạo mật khẩu mới</h1>
              <p>Hãy nhập email đã đăng ký của bạn </p>
              {/* <button
                  className="hidden"
                  id="register"
                  onClick={handleRegisterClick}
                  onFocus={() => setError(null)}
                >
                  Đăng ký
                </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword