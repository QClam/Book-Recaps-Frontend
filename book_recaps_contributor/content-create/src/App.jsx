import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Homepage from './components/Homepage/Homepage';
import Studio from './components/Studio/Studio';
import BookInfo from './components/Studio/BookInfo';
import Content from './components/Studio/Content';
import Detail from './components/DetailBook/Detail';
import Editor from './components/Editor/Editor';
import Settings from './components/Homepage/Settings';
import Profile from './components/Homepage/Profile';
import Contributor from './components/Contributor/Contributor';
import HomeDashboard from './components/HomeDashboard/HomeDashboard';
import ContentSumary from './components/ContentSumary/ContentSumary';
import Application from './components/SendApplication/SendApplication';
import Report from './components/Dashboard/Report';
import WriteRecap from './components/WriteRecap/WriteRecap';
import PopularBookDetail from './components/PopularBook/PopularBookDetail';
import PopularBook from './components/PopularBook/PopularBook';
import BookDetail from './components/PopularBook/BookDetail/BookDetai';
import HeaderLayout from './components/Layout/HeaderLayout';
import MainLayout from './components/Layout/MainLayout';
import BookDetailRecap from './components/PopularBook/BookDetailRecap/BookDetailRecap';
import BookCategory from './components/Homepage/BookCategory/BookCategory';
import SearchFunction from './components/Homepage/SearchFunction/SearchFunction';



function App() {
  return (
    <Router>
       {/* <HeaderLayout /> */}
       <main>
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<BookCategory />} />

        {/* <Route path="/" element={<SearchFunction />} /> */}
        <Route path="/bookcategory/:id" element={<BookDetail />} />
        {/* <Route path="/studio" element={<Studio />} /> */}
        {/* Khi toi click vao write in studio de tom tat sach*/}
        <Route path="/studio" element={<PopularBook />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/book-detail-recap" element={<BookDetailRecap />} /> 

        <Route path="/popular-books-detail" element={<PopularBookDetail />} />
        {/* nếu quyển sách search ko ra kq */}
        <Route path="/book-info" element={<BookInfo />} />

         {/* Khi bấm lưu thông tin trong class BookInfo */}
        {/* <Route path="/content" element={<Content />} />       */}
        {/* Cai tom tat moi lam */}
        <Route path="/content" element={<WriteRecap />} />    
        <Route path="/draft-book" element={<Detail />} />
        {/* <Route path="/studio" element={<Search />} /> */}

      {/* bâm vao new post se nhay toi trang editor qua duong truyen editor */}
        <Route path="/editor" element={<WriteRecap />} />

        </Route>
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} /> {/* Add this route */}

        <Route path="/dashboard" element={<Contributor />} /> 
        <Route path="/dashboardda" element={<HomeDashboard />} />
        <Route path="/contentsum" element={<ContentSumary />} />
        <Route path="/sendapplication" element={<Application />} />

        <Route path="/report" element={<Report />} /> 
      </Routes>
      </main>
    </Router>
  );
}

export default App;
