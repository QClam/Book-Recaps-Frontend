import React, { useEffect, useRef, useState } from "react";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Onboarding from './Components/Onboarding/Onboarding';
import Explore from './Components/Explore/Explore';
import Library from './Components/Library/Library';
import AllBooks from './Components/Library/AllBooks';
//import Spaces from './Components/Space/Spaces';
import HighLight from './Components/Highlight/Highlight';
import BookFree from './Components/TodayFreeRead/BookFree';
import HighlightDetails from './Components/Highlight/HighlightDetails';
import BookDetail from './Components/TodayFreeRead/BookDetail/BookDetai';
import Settings from './Components/Setting/Settings';
import MainLayout from './Components/Layout/MainLayout';
import Help from './Components/Help/Help';
//import ForYou from './Components/ForYou/ForYou';
import ListenBook from './Components/TodayFreeRead/ListenBook/ListenBook';
//import TextToSpeechWithHighlighting from './Components/TodayFreeRead/ListenBook/TextToSpeech';
//import AudioWithHighlight from './Components/TodayFreeRead/AudioWithHighlight/AudioWithHighlight';
//import Footer from './Components/Layout/Footer';
//import BookCarousel from "./Components/ForYou/BookCarousel";
//import AudioGrid from "./Components/TodayFreeRead/BookListen/AudioGrid";
import ReadBook from "./Components/TodayFreeRead/ReadBook/ReadBook";
import ForYouAll from "./Components/ForYou/ForYouAll";
//import SearchUp from "./Components/Search/SearchUp";
//import Filter from "./Components/Search/Filter";
import SearchResults from "./Components/Search/SearchResults/SearchResults";
import BookTrendingDetail from "./Components/Explore/BookTrending/BookTrendingDetail";
import Report from "./Components/Help/Report/Report";
import Application from "./Components/Setting/Application/Application";
//import Authors from "./Components/Space/Author/Authors";
import AuthorBy from "./Components/Space/AuthorBy";
import BooksByCategory from "./Components/Explore/ListCategory/BookByCategory";
import BookByCategoryDetail from "./Components/Explore/ListCategory/BookByCategoryDetail/BookByCategoryDetail";
import AuthorDetail from "./Components/Space/AuthorDetail/AuthorDetail";
import AuthorDetailProfile from "./Components/Space/AuthorDetailProfile/AuthorDetailProfile";
import AuthorGenersDetail from "./Components/Space/AuthorGenersDetail/AuthorGenersDetail";
import Billing from "./Components/Setting/Billing/Billing";
import LibraryBook from "./Components/Library/LibraryBook";
import CustomCategory from "./Components/Explore/NewCategory/Category";
import ExploreCategory from "./Components/Explore/ExploreCategory";
import PopularBookDetail from "./Components/Explore/PopularBook/PopularBookDetail";
import NoteReadBook from "./Components/TodayFreeRead/NoteReadBook/NoteReadBook";
import BookApiDetail from "./Components/Explore/BookApi/BookApiDetail";
import BookDetailItem from "./Components/Explore/BookApi/BookDetailItem";
import AuthorApi from "./Components/Space/AuthorApi/AuthorApi";
import RecapDetails from "./Components/ReadListenBook/RecapDetails";
import Login from "./Components/Auth/Login";
import BookDetailBook from "./Components/Explore/BookApi/BookDetailBook";
import AllBookRecap from "./Components/ReadListenBook/AllBookRecap/AllBookRecap";
import BookListCategory from "./Components/Explore/BookApiCategory/BookListCategory/BookListCategory";
import AuthorBookApi from "./Components/Space/AuthorApi/AuthorBookApi/AuthorBookApi";
import UserRecapDetail from "./Components/ReadListenBook/UserRecap/UserRecapDetail";
import PlaylistBookList from "./Components/Library/PlaylistBook/PlaylistBookList";
import HighlightAll from "./Components/Highlight/HighlightAll";
import RecapByContributor from "./Components/ContributorItem/RecapByContributor/RecapByContributor";

function App() {
  const [completedOnboarding, setCompletedOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const completed = localStorage.getItem('completedOnboarding');
    if (completed) {
      setCompletedOnboarding(true);
    }
    setLoading(false);
  }, []);

  const handleCompletedOnboarding = () => {
    localStorage.setItem('completedOnboarding', 'true');
    setCompletedOnboarding(true);
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div id="root">
        <Router>
            {/* <Header /> */}
          <main>
            
            {!completedOnboarding ? (
              <Onboarding onComplete={handleCompletedOnboarding} />
            ) : (
              <Routes>
                {/* Layout cho các trang có sidebar */}
                <Route element={<MainLayout />}>
                <Route path="/search" element={<SearchResults />} />

                <Route path="/" element={<Explore />} />
                <Route path="/for-you" element={<Explore />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/categories" element={<ExploreCategory />} />
                {/* tu BookApiCategory qua BookListCategory */}
                <Route path="/category/:categoryId" element={<BookListCategory />} />
                {/* explore co book trending co book trending detail */}
                <Route path="/book-trending-detail" element={<BookTrendingDetail />} />
                <Route path="/playlist" element={<LibraryBook />} />
                {/* <Route path="/playlist/:id" element={<PlaylistBookList />} /> */}
                <Route path="/all-books" element={<AllBooks />} />
                <Route path="/author" element={<AuthorBy />} />
                <Route path="/author-book-api/:id" element={<AuthorBookApi />} />
                {/* <Route path="/author" element={<AuthorApi />} /> */}
                {/*trong muc space co Author, Author by r bam vao hien ra list author */}
                <Route path="/author-detail" element={<AuthorDetail />} />
                {/* List author r bam vao xem detail author life bio */}
                <Route path="/author-detail-profile" element={<AuthorDetailProfile />} />
                {/* trong space co author by genre */}
                <Route path="/authors/:genre" element={<AuthorGenersDetail />} />

                {/* Contributor Item */}
                <Route path="/contributor" element={<RecapByContributor />} />

                <Route path="/highlights" element={<HighlightAll />} />
                <Route path="/highlight-details" element={<HighlightDetails />} />
                <Route path="/books" element={<BookFree />} />
                {/* trong BookFree co BookRecap, seemore thay AllBookRecap */}
                <Route path="/all-books-recap" element={<AllBookRecap />} />
                <Route path="/popular-books-detail" element={<PopularBookDetail />} />
                <Route path="/book/:id" element={<BookDetail />} />
                
                {/* trong Explore co Book list by category */}
                {/* <Route path="/books" element={<BooksByCategory />} /> */}
                {/* Book list by category detail */}
                <Route path="/bookbycategory/:id" element={<BookByCategoryDetail />} />
                
                <Route path="/book-api-detail" element={<BookApiDetail />} />
                <Route path="/bookapi/:id" element={<BookDetailItem />} />

                {/* <Route path="/recap/:bookId" element={<RecapDetails />} />  */}
                {/* api book detail trang Books thuoc BookFree */}
                {/* <Route path="/bookdetailbook/:id" element={<BookDetailBook />} /> */}

                {/* Recap User Recap Detail */}
                <Route path="/user-recap-detail/:id" element={<UserRecapDetail />} />


              </Route>

                {/* Route không có sidebar */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/application" element={<Application />} />
                <Route path="/billing" element={<Billing />} />

                <Route path="/help" element={<Report />} />
                {/* <Route path="/report" element={<Report />} /> */}
                {/* Khi bam vao button listen trong today free detail la BookDetail */}
               {/* <Route path="/read" element={<ListenBook />} /> */}
              {/* <Route path="/listen" element={<TextToSpeechWithHighlighting />} />  */}

               {/* <Route path="/read" element={<AudioWithHighlight />} /> */}
               
               {/* <Route path="/read" element={<ReadBook />} /> */}
               {/* <Route path="/read-book" element={<ReadBook />} /> */}
               <Route path="/read" element={<ReadBook key={new Date().getTime()} />} />
               {/* <Route path="/read" element={<NoteReadBook />} /> */}

              <Route path="/login" element={<Login />} />

              </Routes>
            )}
          </main>
        </Router>
        {/* <Footer /> */}
      </div>
    </>
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
