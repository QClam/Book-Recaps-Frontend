import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/Auth";
import { routes } from "../routes";

function AuthWrapper({ children }) {
  const { isAuthenticated, isFirstMountChecking } = useAuth();
  const location = useLocation();

  if (isFirstMountChecking) {
    return <div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={routes.login} state={{ from: location }} replace/>;
  }

  return <>{children}</>;
}

export default AuthWrapper;
