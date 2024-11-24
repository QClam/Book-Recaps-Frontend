// PrivateRoute.js
import { Navigate } from 'react-router-dom';
import { routes } from "../routes";

const PrivateRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to={routes.login} />;
};

export default PrivateRoute;
