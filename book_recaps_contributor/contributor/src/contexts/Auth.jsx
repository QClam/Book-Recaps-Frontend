import { createContext, useContext, useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { setSession } from "../utils/axios";
import { useLoaderData } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const loaderData = useLoaderData()
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [ user, setUser ] = useState(loaderData); // { id, email, name, role }
  // const [ reCaptchaTokens, setReCaptchaTokens ] = useState(null); // { loginToken, signupToken }
  const [ reCaptchaTokens ] = useState({ loginToken: "...", signupToken: "..." });

  useEffect(() => {
    const handleReCaptchaVerify = async () => {
      // if (!executeRecaptcha) {
      //   console.log('Execute recaptcha not yet available');
      //   return;
      // }
      // const loginToken = await executeRecaptcha("login");
      // const signupToken = await executeRecaptcha("signup");

      // setReCaptchaTokens({ loginToken, signupToken });
    }

    handleReCaptchaVerify();
  }, [ executeRecaptcha ]);

  /**
   * @param {object} userData
   * @param {string} userData.email
   * @param {string} userData.name
   * @param {string} userData.role
   * @param {string} accessToken
   */
  const login = (userData, accessToken) => {
    setUser(userData);
    setSession(accessToken);
  };

  const logout = async () => {
    // Dont change the order of the following lines
    setUser(null);
    setSession(null);

    // const loginToken = await executeRecaptcha("login");
    // const signupToken = await executeRecaptcha("signup");

    // setReCaptchaTokens({ loginToken, signupToken });
  };

  const reFetchReCaptchaTokens = async (action) => {
    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available');
      return;
    }

    if (action === "login") {
      // const loginToken = await executeRecaptcha("login");
      // setReCaptchaTokens({ ...reCaptchaTokens, loginToken });
    }

    if (action === "signup") {
      // const signupToken = await executeRecaptcha("signup");
      // setReCaptchaTokens({ ...reCaptchaTokens, signupToken });
    }

    if (!action) {
      // const loginToken = await executeRecaptcha("login");
      // const signupToken = await executeRecaptcha("signup");
      // setReCaptchaTokens({ loginToken, signupToken });
    }
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, reCaptchaTokens, reFetchReCaptchaTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
