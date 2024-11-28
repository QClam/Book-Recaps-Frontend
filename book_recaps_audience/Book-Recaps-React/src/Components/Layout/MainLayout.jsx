import { Outlet } from 'react-router-dom';
import Sidebar from '../SidebarNavigation/Sidebar';
//import Filter from '../Search/Filter';
import '../Search/Filter.scss';

function MainLayout() {
  return (
    <div className="App">
      <header className="header-layout sticky inset-x-0 top-0 bg-white">
        <Sidebar/>
        {/* <Filter /> */}
      </header>
      <div className="main-content">
        <Outlet/>

        <div className="footer">
          ©{new Date().getFullYear()} BookRecaps {import.meta.env.VITE_WEB_NAME}. All rights reserved
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
