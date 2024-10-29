import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/Auth";
import { routes } from "../routes";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routes.login} state={{ from: location }} replace/>;
  }

  return <>{children}</>;
}

export default ProtectedRoute;