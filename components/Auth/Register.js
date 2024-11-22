import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const Register = () => {

    const navigation = useNavigation();

    const [captchaToken, setCaptchaToken] = useState('');

    const [registerForm, setRegisterForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
    });

    const [error, setError] = useState(null);

    const validateForm = () => {
        const fullNameRegex = /^[a-zA-ZÀ-ỹ\s]+$/; // Only accepts letters and spaces
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Valid email format
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Password must have at least 8 characters, one uppercase, one lowercase, one number, and one special character
        const phoneRegex = /^\d{10,11}$/; // Phone number with 10 or 11 digits

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

    const handleSignUp = async () => {
        if (!validateForm()) {
            return; // If form is invalid, stop
        }

        try {
            const newUser = {
                fullName: registerForm.fullName,
                email: registerForm.email,
                password: registerForm.password,
                confirmPassword: registerForm.confirmPassword,
                phoneNumber: registerForm.phoneNumber,
                captchaToken,
            };

            const response = await api.post(
                "/api/register",
                newUser
            );

            console.log("Register Successfully", newUser);
            console.log("Link: ", response.data.message);

            navigation.navigate("ConfirmEmail", { // Change navigate to React Native navigation
                email: registerForm.email,
                message: response.data.message,
            });

            setRegisterForm({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                phoneNumber: "",
            });
            setError(null);
        } catch (error) {
            // Handle errors from the backend
            if (
                error.response &&
                error.response.status === 400 &&
                error.response.data.message
            ) {
                // Check the error message
                setError("Email đã tồn tại, vui lòng sử dụng Email khác để đăng ký.");
            } else {
                console.error("Error registering user:", error);
                setError("Đăng ký thất bại.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>Tạo tài khoản</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Họ & Tên"
                    style={styles.input}
                    value={registerForm.fullName}
                    onChangeText={(text) => setRegisterForm({ ...registerForm, fullName: text })}
                />
                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    value={registerForm.email}
                    onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
                />
                <TextInput
                    placeholder="Mật khẩu"
                    secureTextEntry
                    style={styles.input}
                    value={registerForm.password}
                    onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
                />
                <TextInput
                    placeholder="Xác minh mật khẩu"
                    secureTextEntry
                    style={styles.input}
                    value={registerForm.confirmPassword}
                    onChangeText={(text) => setRegisterForm({ ...registerForm, confirmPassword: text })}
                />
                <TextInput
                    placeholder="Số điện thoại"
                    style={styles.input}
                    value={registerForm.phoneNumber}
                    onChangeText={(text) => setRegisterForm({ ...registerForm, phoneNumber: text })}
                />
            </View>
            <TouchableOpacity
                style={styles.registerButton}
                onPress={() => {
                    if (validateForm()) {
                    }
                }}
            >
                <Text style={styles.registerButtonText}>Đăng ký</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập ngay</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    loginTab: {
        paddingBottom: 5,
    },
    registerTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#008000', // Green color
        paddingBottom: 5,
    },
    tabText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#008000', // Green color
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    registerButton: {
        backgroundColor: '#008000', // Green color
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    orText: {
        textAlign: 'center',
        marginBottom: 20,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        width: '45%',
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    loginText: {
        textAlign: 'center',
        color: '#008000', // Green color
    },
});

export default Register;
