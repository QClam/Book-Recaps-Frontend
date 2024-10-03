import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import Sidebar from "./Components/Sidebar/Sidebar";
import ContentList from "./Components/Content/ContentList";
import Overview from "./Components/Overview/Overview";
import FeedbackContent from "./Components/Content/FeedbackContent";
import Review from "./Components/Review/Review";
import ReviewNote from "./Components/Review/ReviewNote";
import Login from "./Components/Auth/Login";
import UsersList from "./Components/Users/UsersList";
import ConfirmEmail from "./Components/Auth/ConfirmEmail";
import "./App.css";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/auth/confirm-email";

  return (
    <main>
      {!isLoginPage && <Sidebar />}
      <Routes>
        <Route path="/" element={<ContentList />} />
        <Route path="/content" element={<ContentList />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/feedback" element={<FeedbackContent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
        <Route path="/users" element={<UsersList />} />
        <Route
          path="/review/content_version/:id"
          element={<Review />}
        />
        <Route
          path="/note/content_version/:id"
          element={
            <ReviewNote />
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
