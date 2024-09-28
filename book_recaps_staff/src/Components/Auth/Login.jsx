import React, { useState } from "react";
import "./Login.scss";
import axios from "axios";

function Login() {
    const [isActive, setIsActive] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        username: "",
        password: "",
        year_of_birth: "",
        image: "",
        earnings: "",
    });

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
            const response = axios.post(
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
            })
        } catch (error) {
            console.error("Error registering user:", error);
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
                    <form>
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
                        <input type="text" placeholder="Tài khoản" />
                        <input type="password" placeholder="Mật khẩu" />
                        <button>Đăng nhập</button>
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
