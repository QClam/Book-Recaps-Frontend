import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './component/SidebarNavigation/Sidebar';
import Home from './component/Home/Home';
import SubmitBookForm from './component/SubmitBookForm/SubmitBookForm';
import Overview from './component/Overview/Overview';
import ListBook from './component/ListBook/ListBook';
import Notification from './component/Notification/Notification';
import Feedback from './component/Feedback/Feedback';
import Report from './component/Report/Report';
import ContractViewer from './component/Contract/ContractViewer';
import Login from './component/Auth/Login';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import MainLayout from './component/Layout/MainLayout';
import BookList from './component/ListBook/BookList/BookList';
import Settings from './component/Setting/Settings';
import BookGraph from './component/Overview/BookGraph/BookGraph';
import AddBook from './component/ListBook/AddBook/AddBook';
import ContractManager from './component/Contract/ContractManager/ContractManager';
import ContractDetail from './component/Contract/ContractDetail/ContractDetail';
import Dashboard from './component/Dashboard/Dashboard';
import PayoutDetail from './component/Earning/PayoutDetail/PayoutDetail';
import PayoutHistory from './component/Earning/PayoutHistory/PayoutHistory';
import Contract from './component/Contract/Contract/NewContract';
import FetchPublisherData from './component/Publisher/Publisher';
import PublisherPayout from './component/Publisher/PublisherPayout';
import PublisherDashboard from './component/Dashboard/PublisherDashboard';
import UpdateBook from './component/ListBook/UpdateBook/UpdateBook';
import BookDetail from '../../../book_recaps_audience/Book-Recaps-React/src/Components/TodayFreeRead/BookDetail/BookDetai';
import DashboardDetail from './component/Dashboard/DashboardDetail';
import BookListDetail from './component/ListBook/BookList/BookListDetail';
import 'rsuite/dist/rsuite.min.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập, ví dụ như kiểm tra token trong localStorage
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
          <Routes>
          <Route
                  path="/"
                  element={
                    isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" replace />
                  }
                />
           <Route path="/login" element={<Login />} />
           <Route element={<MainLayout />}>

            <Route path="/" element={<Overview/>} />
            {/* <Route path="/contract" element={<ContractViewer />} /> */}
            <Route path="/contractmanager" element={<Contract />} />
            <Route path="/contract-detail/:id" element={<ContractDetail />} />
            {/* <Route path="/bookmanager" element={<ListBook/>} /> */}
            <Route path="/bookmanager" element={<BookList/>} />
            <Route path="/book-detail/:id" element={<BookListDetail />} />
            <Route path="/addbook" element={<AddBook/>} />
            <Route path="/updatebook/:id" element={<UpdateBook />} />
            {/* <Route path="/overview" element={<BookGraph/>} /> */}
            <Route path="/dashboard" element={<Dashboard/>} />
            {/* <Route path="/dashboard" element={<PublisherDashboard/>} /> */}
            {/* <Route path="/earnings" element={<PayoutHistory/>} /> */}
            {/* <Route path="/earnings" element={<PayoutDetail/>} /> */}
            {/* <Route path="/notifications" element={<Notification/>} /> */}
            {/* <Route path="/feedback" element={<Feedback/>} /> */}
            {/* <Route path="/help" element={<Report/>} /> */}
            <Route path="/settings" element={<Settings/>} />
            <Route path="/publisher" element={<FetchPublisherData/>} />
            <Route path="/publisher-payout-detail/:id" element={<PublisherPayout />} /> 
            {/* <Route path="/book-detail-tt/:id" element={<BookDetailbook />} /> */}
            <Route path="/book-dashboard/:bookId" element={<DashboardDetail />} />
            
            
            </Route>

            

          </Routes>        
    </Router>
   
    
  );
};



function AppWrapper() {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <App />
    </GoogleReCaptchaProvider>
  );
}

export default AppWrapper;