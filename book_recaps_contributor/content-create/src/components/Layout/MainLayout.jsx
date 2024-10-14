import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderLayout from './HeaderLayout';
function MainLayout() {
  return (
    <div className="App">
      <header className="header-layout">
        <HeaderLayout />  
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
