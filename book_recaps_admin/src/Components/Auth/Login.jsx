import React, { useEffect, useState } from "react";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { isRoleMatched } from "../../utils/matchRole";
import "./Login.scss";

function Login() {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      setError("reCAPTCHA chưa được khởi tạo");
      return;
    }

    try {
      // Thực hiện reCAPTCHA
      const token = await executeRecaptcha("login");

      const response = await axios.post(
        "https://bookrecaps.cloud/api/tokens",
        {
          email,
          password,
          captchaToken: token,
        }
      );

      const { accessToken, refreshToken } = response.data.message.token;
      const decoded = jwtDecode(accessToken);
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      
      if (isRoleMatched(decoded, "SuperAdmin")) {
        navigate("/dashboard")
        console.log("Login successfully", response.data);
      } else {
        setError("Hãy dùng tài khoản của Admin để đăng nhập");
        console.error("Role mismatch: Access denied");
      }
    } catch (error) {
      setError("Đăng nhập thất bại", error);
    }
  };

  return (
    <div className="login-page">
      <div className={`container ${isActive ? "active" : ""}`} id="container">
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Đăng nhập</h1>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Tài khoản"
              onFocus={() => setError(null)}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mật khẩu"
              onFocus={() => setError(null)}
            />
            <button type="submit">Đăng nhập</button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Xin chào</h1>
              <p>
                Nhập thông tin để sử dụng các chức năng dành cho  
              </p>
              <h3>QUẢN TRỊ VIÊN</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;