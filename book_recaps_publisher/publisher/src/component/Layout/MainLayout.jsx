import { Outlet, useNavigation } from 'react-router-dom';
import { cn } from "../../utils/cn";
import { Suspense } from "react";
import Spinner from "../Spinner";
import { NavBar } from "../NavBar";
import { HeadBar } from "../HeadBar";

// import Sidebar from '../SidebarNavigation/Sidebar';

function MainLayout() {
  const navigation = useNavigation();

  return (
    <div className="flex flex-row h-screen">
      <NavBar/>
      <div className="flex-1 overflow-x-auto flex flex-col">
        <HeadBar/>
        <div
          className={cn({
            "relative flex-1 overflow-auto flex flex-col justify-between bg-gray-50": true,
            "cursor-progress": navigation.state === "loading"
          })}
        >
          <Suspense fallback={
            <div className="flex-1 grid place-items-center">
              <p className="flex items-center">
                <Spinner height={15} width={15}/>
                <span>Loading...</span>
              </p>
            </div>
          }>
            <div className={cn("min-w-[1024px] pb-8 px-6 h-fit")}>
              <Outlet/>
            </div>
          </Suspense>
          <div className="text-center min-w-[1024px] py-2 text-gray-400">
            ©{new Date().getFullYear()} BookRecaps. All rights reserved
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
