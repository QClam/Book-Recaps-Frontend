import { createContext, useContext, useEffect, useState } from "react";
import { axiosInstance, getSession, isRoleMatched, isValidToken, setSession } from "../utils/axios";
import { Navigate, useLoaderData, useLocation, useMatch, useNavigate } from "react-router-dom";
import _ from "lodash";
import { routes } from "../routes";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { handleFetchError } from "../utils/handleFetchError";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const loaderData = useLoaderData();
  const location = useLocation();
  const navigate = useNavigate();

  const [ user, setUser ] = useState(loaderData); // { id, email, name, role, isOnboarded, profileData }
  const [ reCaptchaTokens ] = useState({ loginToken: "...", signupToken: "..." });
  const isAuthenticated = !!user;

  const matchOnboardingRoute = useMatch(routes.onboarding);
  const matchLoginRoute = useMatch(routes.login);
  const matchLogoutRoute = useMatch(routes.logout);

  // Revalidation ở page onboarding. Nếu user đã onboarded thì revalidate để cập nhật onboarding và redirect về index
  useEffect(() => {
    if (!_.isEqual(user, loaderData)) setUser(loaderData);
  }, [ loaderData ]);

  useEffect(() => {
    window.addEventListener("focus", refetchProfileInfo);
    return () => {
      window.removeEventListener("focus", refetchProfileInfo);
    };
  }, [ location ]);

  const refetchProfileInfo = async () => {
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
        (isRoleMatched(decoded, "Contributor") || isRoleMatched(decoded, "Customer")) &&
        response.data?.id === userId
      ) {
        setUser({
          email: decoded.email,
          name: response.data.fullName,
          role: isRoleMatched(decoded, "Contributor") ? "Contributor" : "Customer",
          id: userId,
          isOnboarded: response.data.isOnboarded,
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

  const login = (userData, accessToken) => {
    setUser(userData);
    setSession(accessToken);
  };

  const logout = async () => {
    setUser(null);
    setSession(null);
  };

  // Redirect to onboarding if user is authenticated but not onboarded
  if (isAuthenticated && !user.isOnboarded && !matchOnboardingRoute && !matchLogoutRoute) {
    return <Navigate to={routes.onboarding}/>;
  }

  // Redirect to index if user is authenticated and tries to access login page
  // Redirect to index if user is authenticated and onboarded and tries to access onboarding page
  if (isAuthenticated && (matchLoginRoute || (matchOnboardingRoute && user.isOnboarded))) {
    return <Navigate to={location.state?.from ? location.state.from : routes.index} replace/>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, reCaptchaTokens, setUser, refetchProfileInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
