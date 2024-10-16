import './App.css'
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Sidebar from './Components/Sidebar/Sidebar';
import UsersList from './Components/Users/UserList';
import Login from './Components/Auth/Login';
import PrivateRoute from './Components/Auth/PrivateRoute';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ConfirmEmail from './Components/Auth/ConfirmEmail';


function App() {

  const location = useLocation();
  const isLoginPage = location.pathname === "/auth" || location.pathname === "/auth/confirm-email";

  return (
    <main>
      {!isLoginPage && <Sidebar />}
      <Routes>
        <Route path="/" element={<PrivateRoute> <UsersList /> </PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute> <UsersList /> </PrivateRoute>} />
        <Route path="/auth" element={<Login />} />
        <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
      </Routes>
    </main>
  )
}

function AppWrapper() {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <Router>
        <App />
      </Router>
    </GoogleReCaptchaProvider>
  )
}

export default AppWrapper
