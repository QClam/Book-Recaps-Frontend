import React, { useState } from "react";
import axios from "axios";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import "./Login.scss";

function Login() {
  const [isActive, setIsActive] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    year_of_birth: "",
    image: "",
    earnings: "",
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

  const handleSignUp = async (e) => {
    e.preventDefault();

    const newUser = {
      username: registerForm.username,
      password: registerForm.password,
      role: "audience",
      isContributor: false,
      year_of_birth: registerForm.year_of_birth,
      image: registerForm.image,
      earnings: parseInt(registerForm.earnings, 10),
      create_at: Date.now(),
      update_at: Date.now(),
      id: Date.now().toString(),
    };

    try {
      const response = await axios.post(
        "https://66e3e75ed2405277ed124249.mockapi.io/users",
        newUser
      );
      console.log("Register Successfully", newUser);

      setRegisterForm({
        username: "",
        password: "",
        year_of_birth: "",
        image: "",
        earnings: "",
      });
    } catch (error) {
      console.error("Error registering user:", error);
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
      const token = await executeRecaptcha("login");

      // Login request
      const response = await axios.post(
        "https://160.25.80.100:7124/api/tokens",
        {
            email,
            password,
            captchaToken: token,
        }
      );

      console.log("Login successfully", response.data);
    } catch (error) {
      setError("Đăng nhập thất bại");
    }
  };

  return (
    <div className="login-page">
      <div className={`container ${isActive ? "active" : ""}`} id="container">
        <div className="form-container sign-up">
          <form onSubmit={handleSignUp}>
            <h1>Đăng ký</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook"></i>
              </a>
            </div>
            <span>hoặc sử dụng email để đăng ký</span>
            <input
              type="text"
              placeholder="Tài khoản"
              name="username"
              value={registerForm.username}
              onChange={handleInputChange}
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              name="password"
              value={registerForm.password}
              onChange={handleInputChange}
            />
            <input
              type="text"
              placeholder="Năm sinh"
              name="year_of_birth"
              value={registerForm.year_of_birth}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="image"
              placeholder="Ảnh đại diện"
              value={registerForm.image}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="earnings"
              placeholder="Thu nhập"
              value={registerForm.earnings}
              onChange={handleInputChange}
            />
            <button type="submit">Đăng ký</button>
          </form>
        </div>

        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Đăng nhập</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook"></i>
              </a>
            </div>
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
