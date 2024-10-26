import { createContext, useContext, useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { getSession, isRoleMatched, isValidToken, setSession } from "../utils/axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [ isFirstMountChecking, setIsFirstMountChecking ] = useState(true);
  const [ user, setUser ] = useState(null); // { email, name, role }
  const [ reCaptchaTokens, setReCaptchaTokens ] = useState(null); // { loginToken, signupToken }

  useEffect(() => {
    const token = getSession();

    if (!token) {
      setIsFirstMountChecking(false);
      setSession(null)
      return;
    }

    const decoded = jwtDecode(token)

    if (isValidToken(decoded) && isRoleMatched(decoded, "Contributor")) {
      setUser({
        email: decoded.email,
        name: decoded.name,
        role: decoded[import.meta.env.VITE_CLAIMS_ROLE]
      })
    } else {
      setSession(null)
    }

    setIsFirstMountChecking(false);
  }, []);

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
    setUser(null);
    setSession(null);

    const loginToken = await executeRecaptcha("login");
    const signupToken = await executeRecaptcha("signup");

    setReCaptchaTokens({ loginToken, signupToken });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isFirstMountChecking, reCaptchaTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
