import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/Auth";
import { routes } from "../routes";

function Logout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    navigate(routes.login, { replace: true, state: location.state });
  }, [ logout, navigate ]);

  return null;
}

export default Logout;
