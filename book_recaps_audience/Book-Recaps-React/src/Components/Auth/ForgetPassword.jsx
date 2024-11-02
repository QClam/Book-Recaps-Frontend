import axios from 'axios'; 
import React, { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useNavigate } from 'react-router-dom';
import "../Auth/ForgetPassword.scss";

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
    setRegisterForm({ ...registerForm, email });
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
    setError(null);
  };

  const validateForm = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(registerForm.email)) {
      setError("Email không hợp lệ.");
      return false;
    }

    if (!passwordRegex.test(registerForm.NewPassword)) {
      setError("Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.");
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
      const captchaToken = await executeRecaptcha("reset_password");
      const params = { email: email, captchaToken: captchaToken };
      const response = await axios.post("https://160.25.80.100:7124/api/forget-password", null, { params });

      const resetToken = response.data.message;
      localStorage.setItem("reset_token", resetToken);
      localStorage.setItem("reset_email", email);

      // Hiển thị alert khi gửi thành công
      alert("Vui lòng kiểm tra email của bạn!");

      handleRegisterClick();
    } catch (error) {
      console.error("Error sending forget password request:", error.response?.data || error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
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

      await axios.post("https://160.25.80.100:7124/api/reset-password", null, { params });
      navigate("/login");
      setRegisterForm({ email: "", NewPassword: "", ConfirmPassword: "" });
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.message) {
        setError("Email đã tồn tại, vui lòng sử dụng Email khác.");
      } else {
        console.error("Error sending reset password request:", error.response?.data || error.message);
        setError("Đăng ký thất bại.");
      }
    }
  };

  const loginClick = () => {
    navigate("/login");
  };

  return (
    <div className="forgot-password-page">
      <div className={`forgot-password-container ${isActive ? "active" : ""}`} id="forgot-password-container">

        {/* Form Quên Mật Khẩu */}
        <div className="form-section forget-password">
          <form onSubmit={handleForgetPassword}>
            <h1 className="form-title">Quên Mật Khẩu</h1>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email dùng để đăng nhập"
            />
            <button type="submit" className="submit-btn">Gửi</button>
            <a className="back-link" onClick={loginClick}>Quay trở lại đăng nhập</a>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>

        {/* Form Tạo mới mật khẩu */}
        <div className="form-section reset-password">
          <form onSubmit={handleResetPassword}>
            <h1 className="form-title">Tạo mới mật khẩu</h1>
          
            <span className="instruction">Nhập mật khẩu mới ở đây</span>
            <input
              required
              type="email"
              placeholder="Email"
              name="Email"
              value={localStorage.getItem("reset_email") || registerForm.Email}
              onChange={handleInputChange}
              disabled
            />
            <input
              required
              type="password"
              placeholder="Mật khẩu mới"
              name="NewPassword"
              value={registerForm.NewPassword}
              onChange={handleInputChange}
            />
            <input
              required
              type="password"
              name="ConfirmPassword"
              placeholder="Xác minh Mật khẩu mới"
              value={registerForm.ConfirmPassword}
              onChange={handleInputChange}
            />
            <button type="submit" className="submit-btn">Gửi</button>
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>

      </div>
    </div>
  );
}

export default ForgetPassword;
