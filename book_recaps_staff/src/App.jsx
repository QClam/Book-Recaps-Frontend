import { useState } from "react";
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
import "./App.css";

function App() {
  // const [highlightedSentences, setHighlightedSentences] = useState([]);

  // Custom hook to determine if the current route is the login page
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <main>
      {!isLoginPage && <Sidebar />}
      <Routes>
        <Route path="/" element={<ContentList />} />
        <Route path="/content" element={<ContentList />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/feedback" element={<FeedbackContent />} />
        <Route path="/login" element={<Login />} />
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
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LdFTgMqAAAAAPMELcBY4rySQ1UpT5ZcXvVcj-_J">
      <Router>
        <App />
      </Router>
    </GoogleReCaptchaProvider>
  );
}

export default AppWrapper;
