import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/Auth";
import { routes } from "../routes";

function Logout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    navigate(routes.login, { replace: true });
  }, [ logout, navigate ]);

  return null;
}

export default Logout;
