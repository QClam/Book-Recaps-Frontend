import { createContext, useContext, useEffect, useState } from "react";
// import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../utils/axios";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { routes } from "../routes";
import _ from "lodash";
import { useToast } from "./Toast";
import { handleFetchError } from "../utils/handleFetchError";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const loaderData = useLoaderData()
  const [ user, setUser ] = useState(loaderData); // { id, email, name, role, profileData }
  // const { executeRecaptcha } = useGoogleReCaptcha();
  // const [ reCaptchaTokens, setReCaptchaTokens ] = useState(null); // { loginToken, signupToken }
  const [ reCaptchaTokens ] = useState({ loginToken: "...", signupToken: "..." });

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    const handleFocus = async () => {
      const token = getSession();
      if (!token) {
        navigate(routes.logout, { state: { from: location.pathname } });
        return;
      }

      try {
        const response = await axiosInstance.get("/api/personal/profile");

        if (_.isEqual(user?.profileData, response.data)) return;

        const decoded = jwtDecode(token)
        const userId = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]

        if (
          isValidToken(decoded) &&
          isRoleMatched(decoded, "Contributor") &&
          response.data.id === userId
        ) {
          setUser({
            email: decoded.email,
            name: response.data.fullName,
            role: "Contributor",
            id: userId,
            profileData: response.data,
          });
          navigate(location.pathname, { replace: true });
          return;
        }
        showToast({
          severity: 'error',
          summary: 'Error',
          detail: "Session expired. Please login again.",
        });
        navigate(routes.logout, { state: { from: location.pathname } });
      } catch
        (error) {
        const err = handleFetchError(error);
        console.log("err", err);

        if (err.status === 401) {
          showToast({
            severity: 'error',
            summary: 'Error',
            detail: "Session expired. Please login again.",
          });
          navigate(routes.logout, { state: { from: location.pathname } });
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [ location ]);

// useEffect(() => {
//   const handleReCaptchaVerify = async () => {
//     if (!executeRecaptcha) {
//       console.log('Execute recaptcha not yet available');
//       return;
//     }
//     const loginToken = await executeRecaptcha("login");
//     const signupToken = await executeRecaptcha("signup");
//
//     setReCaptchaTokens({ loginToken, signupToken });
//   }
//
//   handleReCaptchaVerify();
// }, [ executeRecaptcha ]);

  /**
   * @param {object} userData
   * @param {string} userData.id
   * @param {string} userData.email
   * @param {string} userData.name
   * @param {string} userData.role
   * @param {object} userData.profileData
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
    // if (!executeRecaptcha) {
    //   console.log('Execute recaptcha not yet available');
    //   return;
    // }

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
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        reCaptchaTokens,
        reFetchReCaptchaTokens,
        setUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
