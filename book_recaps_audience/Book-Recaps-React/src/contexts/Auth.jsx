import { createContext, useContext, useEffect, useState } from "react";
import { setSession } from "../utils/axios";
import { Navigate, useLoaderData, useLocation, useMatch } from "react-router-dom";
import _ from "lodash";
import { routes } from "../routes";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const loaderData = useLoaderData();
  const location = useLocation();
  const [ user, setUser ] = useState(loaderData); // { id, email, name, isOnboarded, profileData }
  const [ reCaptchaTokens ] = useState({ loginToken: "...", signupToken: "..." });
  const isAuthenticated = !!user;

  const matchOnboardingRoute = useMatch(routes.onboarding);
  const matchLoginRoute = useMatch(routes.login);
  const matchLogoutRoute = useMatch(routes.logout);

  useEffect(() => {
    !_.isEqual(loaderData, user) && setUser(loaderData);
  }, [ loaderData ]);

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
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, reCaptchaTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
