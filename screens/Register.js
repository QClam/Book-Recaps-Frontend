import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

const RegisterScreen = () => {
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
      <Text style={styles.titleText}>Create Account</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Full Name"
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
        />
        <TextInput
          placeholder="Mobile Number"
          style={styles.input}
        />
        <TextInput
          placeholder="Create Password"
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
        />
      </View>
      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
      <Text style={styles.orText}>or Register with</Text>
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
        <Text style={styles.loginText}>Already have an account? Login Now</Text>
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

export default RegisterScreen;
