import React, { useEffect, useRef, useState } from "react";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import './App.css';
import Onboarding from './Components/Onboarding/Onboarding';
import Explore from './Components/Explore/Explore';
//import HighLight from './Components/Highlight/Highlight';
import BookFree from './Components/TodayFreeRead/BookFree';
//import HighlightDetails from './Components/Highlight/HighlightDetails';
import BookDetail from './Components/TodayFreeRead/BookDetail/BookDetai';
import Settings from './Components/Setting/Settings';
import MainLayout from './Components/Layout/MainLayout';
//import ReadBook from "./Components/TodayFreeRead/ReadBook/ReadBook";
import SearchResults from "./Components/Search/SearchResults/SearchResults";
import Report from "./Components/Help/Report/Report";
import Application from "./Components/Setting/Application/Application";
import AuthorBy from "./Components/Space/AuthorBy";
import BookByCategoryDetail from "./Components/Explore/ListCategory/BookByCategoryDetail/BookByCategoryDetail";
import AuthorDetailProfile from "./Components/Space/AuthorDetailProfile/AuthorDetailProfile";
import AuthorGenersDetail from "./Components/Space/AuthorGenersDetail/AuthorGenersDetail";
import Billing from "./Components/Setting/Billing/Billing";
import LibraryBook from "./Components/Library/LibraryBook";
import ExploreCategory from "./Components/Explore/ExploreCategory";
import BookApiDetail from "./Components/Explore/BookApi/BookApiDetail";
import BookDetailItem from "./Components/Explore/BookApi/BookDetailItem";
import Login from "./Components/Auth/Login";
import AllBookRecap from "./Components/ReadListenBook/AllBookRecap/AllBookRecap";
import BookListCategory from "./Components/Explore/BookApiCategory/BookListCategory/BookListCategory";
import AuthorBookApi from "./Components/Space/AuthorApi/AuthorBookApi/AuthorBookApi";
import UserRecapDetail from "./Components/ReadListenBook/UserRecap/UserRecapDetail";
import RecapByContributor from "./Components/ContributorItem/RecapByContributor/RecapByContributor";
import ConfirmEmail from "./Components/Auth/ConfirmEmail";
import ForgetPassword from "./Components/Auth/ForgetPassword";
import ContributorTerm from "./Components/Setting/BecomeContributor/ContributorTerm";
//import PrivateRoute from "./Components/PrivateRoute";

function App() {
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
            {/* <Header /> */}
          
            
           
              <Routes>
                {/* Layout cho các trang có sidebar */}
                 {/* Điều hướng tới trang /login nếu chưa đăng nhập */}
                <Route
                  path="/"
                  element={
                    isAuthenticated ? <Navigate to="/explore" /> : <Navigate to="/login" replace />
                  }
                />
                 <Route path="/login" element={<Login />} />

                <Route element={<MainLayout />}>
                <Route path="/search" element={<SearchResults />} />

                <Route path="/" element={<Explore />} />
                
                <Route path="/explore" element={<Explore />} />
                
                <Route path="/categories" element={<ExploreCategory />} />
               
                <Route path="/category/:categoryId" element={<BookListCategory />} />
               
                <Route path="/playlist" element={<LibraryBook />} />
                
                <Route path="/author" element={<AuthorBy />} />

                <Route path="/author-book-api/:id" element={<AuthorBookApi />} />
                
                <Route path="/author-detail-profile" element={<AuthorDetailProfile />} />
                
                <Route path="/authors/:genre" element={<AuthorGenersDetail />} />

                {/* Contributor Item */}
                <Route path="/contributor" element={<RecapByContributor />} />

                
                <Route path="/books" element={<BookFree />} />
                {/* trong BookFree co BookRecap, seemore thay AllBookRecap */}
                <Route path="/all-books-recap" element={<AllBookRecap />} />
                
                <Route path="/book/:id" element={<BookDetail />} />
                

                <Route path="/bookbycategory/:id" element={<BookByCategoryDetail />} />
                
                <Route path="/book-api-detail" element={<BookApiDetail />} />

                <Route path="/bookapi/:id" element={<BookDetailItem />} />

                {/* Recap User Recap Detail */}
                <Route path="/user-recap-detail/:id" element={<UserRecapDetail />} />


              </Route>

                {/* Route không có sidebar */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/application" element={<Application />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/help" element={<Report />} />
                <Route path="/become-contributor" element={<ContributorTerm />} />
               {/* <Route path="/read" element={<ReadBook key={new Date().getTime()} />} /> */}               

              {/* <Route path="/login" element={<Login />} /> */}
            
              {/* Confirm mail khi dang ki */}
              <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/forget-password" element={ <ForgetPassword /> } />
              </Routes>
        
        
        </Router>
       
      
   
  );
}

function AppWrapper() {
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
     
        <App />
      
    </GoogleReCaptchaProvider>
  );
}

export default AppWrapper;
