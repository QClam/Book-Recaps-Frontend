import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';

import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {

  const navigation = useNavigation();

  const clearOnboarding = async () => {
    try {
        await AsyncStorage.removeItem('@viewedOnboarding')
    } catch (error) {
        console.log('Error @clearOnboarding', error);
    }
    Alert.alert('Cleared AsyncStorage')
}

  const handleLogin = () => {
    try {
      navigation.navigate("Home")
    } catch (error) {
      console.log('Login Error', error);
    }
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity style={styles.loginTab}>
          <Text style={styles.tabText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerTab}>
          <Text style={styles.tabText}>REGISTER</Text>
        </TouchableOpacity>
      </View> */}
      <Text style={styles.welcomeText}>Welcome Back!</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />
      </View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.rememberPassword}>
          <Text>Remember Password</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.orText}>or Login with</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png'}}
            style={styles.socialIcon}
          />
          <Text>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg'}}
            style={styles.socialIcon}
          />
          <Text>Facebook</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity>
        <Text style={styles.registerText}>Don't have an account? Register Now</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={clearOnboarding} style={{justifyContent: "center", alignItems: "center", marginTop: 20}}>
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

export default LoginScreen;
