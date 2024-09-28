import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../SidebarNavigation/Sidebar';
//import Filter from '../Search/Filter';
import Filter from '../Search/Filter';
function MainLayout() {
  return (
    <div className="App">
      <header className="header-layout">
        <Sidebar />
    {/* <Filter /> */}
      </header>
      <div className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
