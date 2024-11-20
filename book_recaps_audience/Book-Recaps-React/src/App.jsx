import React, { useEffect, useRef, useState } from "react";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Đừng quên import CSS
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import './App.css';
//import Onboarding from './Components/Onboarding/Onboarding';
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
import ContributorRecaps from "./Components/ContributorItem/ContributorRecaps/ContributorRecaps";
import Result from "./Components/Setting/Billing/Result/Result";
import OnboardingStepper from "./Components/Onboarding/OnboardML/Onboarding";
import BookByList from "./Components/ReadListenBook/UserRecap/BookByList/BookByList";
import UserRecapNewDetail from "./Components/ReadListenBook/UserRecap/UserRecapNewDetail/UserRecapNewDetail";
import NewRecapBook from "./Components/ReadListenBook/UserRecap/NewRecapBook/NewRecapBook";
import RecapVersionNew from "./Components/ReadListenBook/UserRecap/NewRecapBook/RecapVersionNew";
import UserRecapDetailv2 from "./Components/ReadListenBook/UserRecap/NewRecapBook/UserRecapDetailv2";
import UsRecapDetail from "./Components/ReadListenBook/UserRecap/UserRecapNewDetail/UsRecapDetail";
import RecapNewTues from "./Components/ReadListenBook/UserRecap/UserRecapNewDetail/RecapNewTues";
import History from "./Components/History/History";
import ForUser from "./Components/Home/ForUser/ForUser";
import Homepage from "./Components/Home/Homepage";
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
   // Check if the user has completed the onboarding process
   const isOnboarded = localStorage.getItem("isOnboarded") === 'true';



  return (
     
        <Router>
            {/* <Header /> */}
          
            
           
              <Routes>
                {/* Layout cho các trang có sidebar */}
                 {/* Điều hướng tới trang /login nếu chưa đăng nhập */}
                 <Route
          path="/"
          element={
            isAuthenticated
              ? (isOnboarded ? <Navigate to="/explore" /> : <Navigate to="/onboarding" />)
              : <Navigate to="/login" />
          }
        />

                 <Route path="/login" element={<Login />} />

                <Route element={<MainLayout />}>
                <Route path="/search" element={<SearchResults />} />

                {/* <Route path="/" element={<Explore />} /> */}
                
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
                {/* <Route path="/contributor-recaps/:userId" element={<ContributorRecaps />} /> */}

                
                <Route path="/books" element={<BookFree />} />

                <Route path="/book-by-list" element={<BookByList />} />
                {/* trong BookFree co BookRecap, seemore thay AllBookRecap */}
                <Route path="/all-books-recap" element={<AllBookRecap />} />
                
                <Route path="/book/:id" element={<BookDetail />} />
                

                <Route path="/bookbycategory/:id" element={<BookByCategoryDetail />} />
                
                <Route path="/book-api-detail" element={<BookApiDetail />} />

                <Route path="/bookapi/:id" element={<BookDetailItem />} />

                {/* Recap User Recap Detail */}
                <Route path="/user-recap-detail/:id" element={<UserRecapDetail />} />

                {/* <Route path="/user-recap-new-detail" element={<UserRecapNewDetail />} /> */}
                {/* <Route path="/user-recap-new-detail" element={<UserRecapDetail />} /> */}

                {/* MAI LM TIEP */}
                <Route path="/user-recap-detail-item/:id" element={<UsRecapDetail />} />
                <Route path="/recap-item-detail/:recapId" element={<RecapNewTues />} />

                {/* TEST NEW RECAP BOOK */}
                {/* <Route path="/new" element={<NewRecapBook />} /> */}
                {/* <Route path="/recap-version/:versionId" element={<RecapVersionNew />} /> */}
                {/* <Route path="/user-recap/:recapId" element={<UserRecapDetailv2 />} /> */}
               
                <Route path="/history" element={<History />} />
                <Route path="/home" element={<Homepage />} />

              </Route>

                {/* Route không có sidebar */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/application" element={<Application />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/*" element={<Result />} />
                <Route path="/help" element={<Report />} />
                <Route path="/become-contributor" element={<ContributorTerm />} />
              
               {/* <Route path="/read" element={<ReadBook key={new Date().getTime()} />} /> */}               

              {/* <Route path="/login" element={<Login />} /> */}
            
              {/* Confirm mail khi dang ki */}
              <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
              <Route path="/onboarding" element={<OnboardingStepper />} />
              <Route path="/forget-password" element={ <ForgetPassword /> } />
              </Routes>
          
          
           <ToastContainer />
        
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
