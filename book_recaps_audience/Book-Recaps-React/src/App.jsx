import React, { useEffect, useRef, useState } from "react";

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
                {/* explore co book trending co book trending detail */}
                <Route path="/book-trending-detail" element={<BookTrendingDetail />} />
                <Route path="/library" element={<LibraryBook />} />
                <Route path="/all-books" element={<AllBooks />} />
                <Route path="/spaces" element={<AuthorBy />} />
                {/*trong muc space co Author, Author by r bam vao hien ra list author */}
                <Route path="/author-detail" element={<AuthorDetail />} />
                {/* List author r bam vao xem detail author life bio */}
                <Route path="/author-detail-profile" element={<AuthorDetailProfile />} />
                {/* trong space co author by genre */}
                <Route path="/authors/:genre" element={<AuthorGenersDetail />} />


                <Route path="/highlights" element={<HighLight />} />
                <Route path="/highlight-details" element={<HighlightDetails />} />
                <Route path="/today" element={<BookFree />} />
                <Route path="/popular-books-detail" element={<PopularBookDetail />} />
                <Route path="/book/:id" element={<BookDetail />} />
                
                {/* trong Explore co Book list by category */}
                <Route path="/books" element={<BooksByCategory />} />
                {/* Book list by category detail */}
                <Route path="/bookbycategory/:id" element={<BookByCategoryDetail />} />
                
                <Route path="/book-api-detail" element={<BookApiDetail />} />
              </Route>

                {/* Route không có sidebar */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/application" element={<Application />} />
                <Route path="/billing" element={<Billing />} />

                <Route path="/help" element={<Help />} />
                <Route path="/report" element={<Report />} />
                {/* Khi bam vao button listen trong today free detail la BookDetail */}
               {/* <Route path="/read" element={<ListenBook />} /> */}
              {/* <Route path="/listen" element={<TextToSpeechWithHighlighting />} />  */}

               {/* <Route path="/read" element={<AudioWithHighlight />} /> */}
               
               {/* <Route path="/read" element={<ReadBook />} /> */}
               {/* <Route path="/read-book" element={<ReadBook />} /> */}
               <Route path="/read" element={<ReadBook key={new Date().getTime()} />} />
               {/* <Route path="/read" element={<NoteReadBook />} /> */}

              

              </Routes>
            )}
          </main>
        </Router>
        {/* <Footer /> */}
      </div>
    </>
  );
}

export default App;
