import React, { useState } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useNavigate } from 'react-router-dom'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
} from '@mui/material';
import api from '../Auth/AxiosInterceptors';

function AddUserModal({ open, onClose, onUpdate}) {

    const navigate = useNavigate();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [error, setError] = useState(null); // Error state

    const [registerForm, setRegisterForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
    });

    const validateForm = () => {
        const fullNameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const phoneRegex = /^\d{10,11}$/;

        if (!fullNameRegex.test(registerForm.fullName)) {
            setError("Họ và tên không hợp lệ.");
            return false;
        }
        if (!emailRegex.test(registerForm.email)) {
            setError("Email không hợp lệ.");
            return false;
        }
        if (!passwordRegex.test(registerForm.password)) {
            setError(
                "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
            );
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

        setError(null);
        return true;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm({ ...registerForm, [name]: value });
        setError(null);
        console.log(value);
    };

    const resetForm = () => {
        setRegisterForm({
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
        });
        setError(null);
        setEditingUserId(null); // Reset user đang chỉnh sửa khi đóng modal
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return; // Nếu form không hợp lệ, dừng lại
        }

        if (!executeRecaptcha) {
            setError("reCAPTCHA chưa được khởi tạo");
            return;
        }

        try {
            const token = await executeRecaptcha("signup");

            const newUser = {
                fullName: registerForm.fullName,
                email: registerForm.email,
                password: registerForm.password,
                confirmPassword: registerForm.confirmPassword,
                phoneNumber: registerForm.phoneNumber,
                captchaToken: token,
            };

            const response = await api.post(
                "/api/register",
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

            resetForm();
            setError(null);
        } catch (error) {
            // Bắt lỗi và back-end trả về
            if (
                error.response &&
                error.response.status === 400 &&
                error.response.data.message
            ) {
                // Kiểm tra thông báo lỗi
                setError("Email đã tồn tại, vui lòng sử dụng Email khác để đăng ký.");
            } else {
                console.error("Error registering user:", error);
                setError("Đăng ký thất bại.");
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Thêm người dùng mới</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Họ và tên"
                    name="fullName"
                    value={registerForm.fullName}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Email"
                    name="email"
                    type="email"
                    value={registerForm.email}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Mật khẩu"
                    name="password"
                    type="password"
                    value={registerForm.password}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Số điện thoại"
                    name="phoneNumber"
                    value={registerForm.phoneNumber}
                    onChange={handleInputChange}
                />
                {error && (
                    <Typography color="error" variant="body2" mt={2}>
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Hủy
                </Button>
                <Button onClick={handleAddUser} color="primary" variant="contained">
                    Thêm
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddUserModal