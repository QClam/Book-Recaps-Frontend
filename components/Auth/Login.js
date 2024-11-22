import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Login = () => {

    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    const clearOnboarding = async () => {
        try {
            await AsyncStorage.removeItem('@viewedOnboarding')
        } catch (error) {
            console.log('Error @clearOnboarding', error);
        }
        Alert.alert('Cleared AsyncStorage')
    }

    const handleLogin = async () => {

        setIsLoading(true);
        try {
            const response = await axios.post('https://bookrecaps.cloud/api/tokens', {
                email,
                password,
                captchaToken,
            });
            const { accessToken, refreshToken } = response.data.message.token;
            await AsyncStorage.setItem("access_token", accessToken);
            await AsyncStorage.setItem("refresh_token", refreshToken);

            console.log("Access_Token: ", accessToken);
            

            navigation.replace("Tabs");
        } catch (error) {
            console.log('Login Error:', error?.response?.data || error.message);
            const errorMessage = "Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.";
            setError(errorMessage);
            Alert.alert("Lỗi đăng nhập", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    placeholder="Mật khẩu"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />
            </View>
            <View style={styles.optionsContainer}>
            <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>Đăng nhập</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity>
                <Text style={styles.registerText}>Không có tài khoản? Đăng ký ngay</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearOnboarding} style={{ justifyContent: "center", alignItems: "center", marginTop: 20 }}>
                <Text>Clear Onboarding</Text>
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
        borderBottomWidth: 2,
        borderBottomColor: '#008000', // Green color
        paddingBottom: 5,
    },
    registerTab: {
        paddingBottom: 5,
    },
    tabText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#008000', // Green color
    },
    welcomeText: {
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
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    rememberPassword: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    forgotPassword: {
        color: 'red',
    },
    loginButton: {
        backgroundColor: '#008000', // Green color
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonText: {
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
    registerText: {
        textAlign: 'center',
        color: '#008000', // Green color
    },
});

export default Login;
