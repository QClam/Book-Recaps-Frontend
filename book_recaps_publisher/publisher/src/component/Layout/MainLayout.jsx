import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../SidebarNavigation/Sidebar';


function MainLayout() {
  return (
    <div className="App">
     
         <Sidebar />
      <div className="main-content">
       
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
