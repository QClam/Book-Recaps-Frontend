import { createContext, useContext, useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { getSession, isRoleMatched, isValidToken, setSession } from "../utils/axios";
import { Outlet, useLoaderData } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider() {
  const loaderData = useLoaderData()
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [ user, setUser ] = useState(loaderData); // { id, email, name, role }
  const [ reCaptchaTokens, setReCaptchaTokens ] = useState(null); // { loginToken, signupToken }

  useEffect(() => {
    const handleReCaptchaVerify = async () => {
      if (!executeRecaptcha) {
        console.log('Execute recaptcha not yet available');
        return;
      }
      const loginToken = await executeRecaptcha("login");
      const signupToken = await executeRecaptcha("signup");

      setReCaptchaTokens({ loginToken, signupToken });
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

    const loginToken = await executeRecaptcha("login");
    const signupToken = await executeRecaptcha("signup");

    setReCaptchaTokens({ loginToken, signupToken });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, reCaptchaTokens }}>
      <Outlet/>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export const sessionLoader = () => {
  const token = getSession();

  if (!token) {
    setSession(null)
    return null;
  }

  const decoded = jwtDecode(token)

  if (isValidToken(decoded) && isRoleMatched(decoded, "Contributor")) {
    return {
      email: decoded.email,
      name: decoded[import.meta.env.VITE_CLAIMS_NAME],
      role: decoded[import.meta.env.VITE_CLAIMS_ROLE],
      id: decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]
    }
  }
  setSession(null)
  return null;
}

