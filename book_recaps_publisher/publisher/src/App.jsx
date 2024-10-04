import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './component/SidebarNavigation/Sidebar';
import Home from './component/Home/Home';
import SubmitBookForm from './component/SubmitBookForm/SubmitBookForm';
import Overview from './component/Overview/Overview';
import ListBook from './component/ListBook/ListBook';
import Notification from './component/Notification/Notification';
import Feedback from './component/Feedback/Feedback';
import Report from './component/Report/Report';
import ContractViewer from './component/Contract/ContractViewer';


const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        {/* Main content */}
        <div className="content">
          {/* Use Routes to wrap all the Route components */}
          <Routes>
            
            <Route path="/" element={<Overview/>} />
            <Route path="/contract" element={<ContractViewer />} />
            <Route path="/bookmanager" element={<ListBook/>} /> {/* New route for SubmitBookForm */}
            <Route path="/overview" element={<Overview/>} />
            <Route path="/notifications" element={<Notification/>} />
            <Route path="/feedback" element={<Feedback/>} />
            <Route path="/help" element={<Report/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
