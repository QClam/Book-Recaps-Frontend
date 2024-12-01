import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from "../contexts/Auth";
import { routes } from "../routes";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routes.login} state={{ from: location.pathname }} replace/>;
  }

  return <Outlet/>;
}

export default ProtectedRoute;
