import _ from "lodash";
import { createContext, useContext, useEffect, useState } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { routes } from "../routes"
import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../utils/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { handleFetchError } from "../utils/handleError";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const loaderData = useLoaderData()
  const [ user, setUser ] = useState(loaderData); // { id, email, name, role, profileData }

  const navigate = useNavigate();
  const location = useLocation();

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

        const decoded = jwtDecode(token)
        const userId = decoded[import.meta.env.VITE_CLAIMS_IDENTIFIER]

        if (
          isValidToken(decoded) &&
          isRoleMatched(decoded, "SuperAdmin") &&
          response.data.id === userId
        ) {
          setUser({
            email: decoded.email,
            name: response.data.fullName,
            role: "SuperAdmin",
            id: userId,
            profileData: response.data,
          });
          navigate(location.pathname, { replace: true });
          return;
        }
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        navigate(routes.logout, { state: { from: location.pathname } });
      } catch
        (error) {
        const err = handleFetchError(error);
        console.log("err", err);

        if (err.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
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
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        setUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
