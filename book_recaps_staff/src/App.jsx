import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

import Sidebar from "./Components/Sidebar/Sidebar";
import Overview from "./Components/Overview/Overview";
import FeedbackContent from "./Components/Recaps/FeedbackContent";
import Review from "./Components/Review/Review";
import ReviewNote from "./Components/Review/ReviewNote";
import Login from "./Components/Auth/Login";
import UsersList from "./Components/Users/UsersList";
import ConfirmEmail from "./Components/Auth/ConfirmEmail";
import PrivateRoute from "./Components/Auth/PrivateRoute";
import RecapsList from "./Components/Recaps/RecapsList";
import UserProfile from "./Components/Auth/UserProfile";
import ForgetPassword from "./Components/Auth/ForgetPassword";
import Dashboard from "./Components/Dashboard/Dashboard";
import AppealList from "./Components/Appeal/AppealList";

import "./App.css";
import AppealResponse from "./Components/Appeal/AppealResponse";
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
        <Route path="/" element={<PrivateRoute> <RecapsList /> </PrivateRoute>} />
        <Route path="/recaps" element={<PrivateRoute> <RecapsList /> </PrivateRoute>} />
        <Route path="/overview" element={<PrivateRoute> <Overview /> </PrivateRoute>} />
        <Route path="/feedback" element={<PrivateRoute> <FeedbackContent /> </PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
        <Route path="/users" element={<PrivateRoute> <UsersList /> </PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute> <UserProfile /> </PrivateRoute>} />
        <Route path="/dashboard" element={<Dashboard /> } />
        <Route path="/appeal" element={<AppealList /> } />
        <Route path="/appeal/response/:id" element={<AppealResponse /> } />
        <Route path="/forget-password" element={ <ForgetPassword /> } />
        <Route
          path="/review/content_version/:id"
          element={<PrivateRoute> <Review /> </PrivateRoute>} />
        <Route
          path="/note/content_version/:id"
          element={
            <PrivateRoute> <ReviewNote /> </PrivateRoute>
          }
        />
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
