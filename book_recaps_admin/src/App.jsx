import './App.css'
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Sidebar from './Components/Sidebar/Sidebar';
import UsersList from './Components/Users/UserList';


function App() {

  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <main>
      {!isLoginPage && <Sidebar />}
      <Routes>
        <Route path="/users" element={<UsersList />} />
      </Routes>
    </main>
  )
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}

export default AppWrapper
