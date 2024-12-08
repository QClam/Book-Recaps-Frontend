import _ from "lodash";
import { createContext, useContext, useEffect, useState } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "./Toast";
import { routes } from "../routes"
import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../utils/axios";
import { jwtDecode } from "jwt-decode";
import { handleFetchError } from "../utils/handleFetchError";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const loaderData = useLoaderData()
  const [ user, setUser ] = useState(loaderData); // { id, email, name, role, profileData, publisherData }
  const [ reCaptchaTokens ] = useState({ loginToken: "...", signupToken: "..." });

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    const handleFocus = async () => {
      const token = getSession();
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await axiosInstance.get("/api/personal/profile");

        if (_.isEqual(user?.profileData, response.data)) return;

        const publisherRes = await axiosInstance.get("/api/publisher/getbypublisheruser/" + response.data?.id);

        const decoded = jwtDecode(token)
        const userId = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]

        if (
          publisherRes.data &&
          isValidToken(decoded) &&
          isRoleMatched(decoded, "Publisher") &&
          response.data.id === userId
        ) {
          localStorage.setItem("publisher", publisherRes.data.id);
          setUser({
            email: decoded.email,
            name: response.data.fullName,
            role: "Publisher",
            id: userId,
            profileData: response.data,
            publisherData: publisherRes.data,
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

  const login = (userData, accessToken) => {
    setUser(userData);
    setSession(accessToken);
  };

  const logout = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem("publisher");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        reCaptchaTokens,
        setUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
