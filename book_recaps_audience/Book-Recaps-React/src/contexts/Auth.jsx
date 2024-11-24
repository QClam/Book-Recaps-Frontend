import { createContext, useContext, useState } from "react";
import { setSession } from "../utils/axios";
import { Navigate, useLoaderData, useMatch } from "react-router-dom";
import { routes } from "../routes";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const loaderData = useLoaderData()
  const [ user, setUser ] = useState(loaderData); // { id, email, name, isOnboarded, profileData }
  const [ reCaptchaTokens ] = useState({ loginToken: "...", signupToken: "..." });
  const matchOnboardingRoute = useMatch(routes.onboarding);
  const matchLoginRoute = useMatch(routes.login);
  const isAuthenticated = !!user;

  const login = (userData, accessToken) => {
    setUser(userData);
    setSession(accessToken);
  };

  const logout = async () => {
    setUser(null);
    setSession(null);
  };

  // Redirect to onboarding if user is authenticated but not onboarded
  if (isAuthenticated && !user.isOnboarded && !matchOnboardingRoute) {
    return <Navigate to={routes.onboarding}/>;
  }

  // Redirect to index if user is authenticated and tries to access login page
  if (isAuthenticated && matchLoginRoute) {
    return <Navigate to={routes.index} replace/>;
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
