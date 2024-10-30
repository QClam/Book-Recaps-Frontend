import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../utils/axios";
import { Outlet, useLoaderData } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Toast } from "primereact/toast";

const AuthContext = createContext(null);

export function AuthProvider() {
  const loaderData = useLoaderData()
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [ user, setUser ] = useState(loaderData); // { id, email, name, role }
  const [ reCaptchaTokens, setReCaptchaTokens ] = useState(null); // { loginToken, signupToken }
  const toast = useRef(null);

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

  const showToast = ({ severity, summary, detail }) => {
    toast.current.show({ severity, summary, detail, life: 3000 });
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, reCaptchaTokens, showToast }}>
      <Toast ref={toast} position="top-center"/>
      <Outlet/>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export const sessionLoader = async () => {
  const token = getSession();

  if (!token) {
    setSession(null)
    return null;
  }

  let responseId = null;

  try {
    const response = await axiosInstance.get("/api/personal/profile");
    responseId = response.data.id || null;
  } catch (e) {
    console.error(e);
  }

  const decoded = jwtDecode(token)

  if (
    isValidToken(decoded) &&
    isRoleMatched(decoded, "Contributor") &&
    responseId === decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]
  ) {
    return {
      email: decoded.email,
      name: decoded[import.meta.env.VITE_CLAIMS_NAME],
      role: "Contributor",
      id: decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]
    }
  }
  setSession(null)
  return null;
}

