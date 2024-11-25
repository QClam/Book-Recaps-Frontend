import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

import Sidebar from "./Components/Sidebar/Sidebar";
import Review from "./Components/Review/Review";
import Login from "./Components/Auth/Login";
import UsersList from "./Components/Users/UsersList";
import ConfirmEmail from "./Components/Auth/ConfirmEmail";
import PrivateRoute from "./Components/Auth/PrivateRoute";
import ForgetPassword from "./Components/Auth/ForgetPassword";
import Dashboard from "./Components/Dashboard/Dashboard";
import AppealList from "./Components/Appeal/AppealList";
import ReportList from "./Components/Report/ReportList";
import WithdrawalList from "./Components/WithDrawal/WithDrawalList";

import "./App.css";
import RecapVersions from "./Components/Recaps/RecapVersions";
function App() {
  const location = useLocation();
  const isLoginPage = 
    location.pathname === "/login" || 
    location.pathname === "/auth/confirm-email" || 
    location.pathname === "/forget-password";

  return (
    <main>
      {!isLoginPage && <Sidebar />}
      <Routes>
      {/* Cần đăng nhập để vào route */}
        <Route path="/" element={<PrivateRoute> <Dashboard /> </PrivateRoute>} />
        <Route path="/recaps" element={<PrivateRoute> <RecapVersions /> </PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute> <UsersList /> </PrivateRoute>} />
        <Route path="/withdrawl" element={<PrivateRoute> <WithdrawalList /> </PrivateRoute>} />
        <Route path="/dashboard" element={<Dashboard /> } />
        <Route path="/appeals" element={<PrivateRoute> <AppealList /> </PrivateRoute> } />
        <Route path="/reports" element={<PrivateRoute> <ReportList /> </PrivateRoute> } />
        <Route
          path="/review/content_version/:id"
          element={<PrivateRoute> <Review /> </PrivateRoute>} />

      {/* Không cần đăng nhập để vào route */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
          <Route path="/forget-password" element={ <ForgetPassword /> } />
      </Routes>
    </main>
  );
}

function AppWrapper() {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <Router>
        <App />
      </Router>
    </GoogleReCaptchaProvider>
  );
}

export default AppWrapper;
