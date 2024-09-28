import React, { useState } from 'react';
import './Login.scss';

function Login({ onLoginSuccess }) {  // Accept callback as a prop
    const [isActive, setIsActive] = useState(false);

    const handleRegisterClick = () => {
        setIsActive(true);
    };

    const handleLoginClick = () => {
        // Handle login logic here
        setIsActive(false);
        onLoginSuccess();  // Call the parent component's function to update the login state
    };

    return (
        <div className='login-page'>
            <div className={`container ${isActive ? 'active' : ''}`} id='container'>
                {/* Sign up form */}
                <div className="form-container sign-up">
                    <form>
                        <h1>Đăng ký</h1>
                        <div className="social-icons">
                            <a href="#" className='icon'><i className="fa-brands fa-google"></i></a>
                            <a href="#" className='icon'><i className="fa-brands fa-facebook"></i></a>
                        </div>
                        <span>hoặc sử dụng email để đăng ký</span>
                        <input type="text" placeholder='Tài khoản' />
                        <input type="email" placeholder='Email' />
                        <input type="password" placeholder='Mật khẩu' />
                        <button>Đăng ký</button>
                    </form>
                </div>

                {/* Sign in form */}
                <div className="form-container sign-in">
                    <form>
                        <h1>Đăng nhập</h1>
                        <div className="social-icons">
                            <a href="#" className='icon'><i className="fa-brands fa-google"></i></a>
                            <a href="#" className='icon'><i className="fa-brands fa-facebook"></i></a>
                        </div>
                        <span>hoặc sử dụng email để đăng nhập</span>
                        <input type="text" placeholder='Tài khoản' />
                        <input type="password" placeholder='Mật khẩu' />
                        <button type="button" onClick={handleLoginClick}>Đăng nhập</button>  {/* Call login function */}
                    </form>
                </div>

                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Chào mừng trở lại</h1>
                            <p>Nhập thông tin cá nhân để sử dụng các chức năng của trang web</p>
                            <button className='hidden' id='login' onClick={handleLoginClick}>Đăng nhập</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Xin chào</h1>
                            <p>Đăng ký thông tin cá nhân để sử dụng các chức năng của trang web</p>
                            <button className='hidden' id='register' onClick={handleRegisterClick}>Đăng ký</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
