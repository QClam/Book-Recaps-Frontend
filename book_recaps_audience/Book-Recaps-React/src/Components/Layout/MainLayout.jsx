import { Outlet } from 'react-router-dom';
import Sidebar from '../SidebarNavigation/Sidebar';
//import Filter from '../Search/Filter';

import '../Search/Filter.scss';

function MainLayout() {
  return (
    <div className="App">
      <header className="header-layout">
        <Sidebar/>
        {/* <Filter /> */}
      </header>
      <div className="main-content">
        <div className="page-content">
          <Outlet/>
        </div>

        <div className="footer">
          ©{new Date().getFullYear()} BookRecaps {import.meta.env.VITE_WEB_NAME}. All rights reserved
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
