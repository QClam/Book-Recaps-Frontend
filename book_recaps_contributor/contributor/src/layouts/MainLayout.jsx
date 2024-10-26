import { Suspense } from "react";
import Spinner from "../components/Spinner";
import { HeadBar } from "../components/HeadBar";
import { NavBar } from "../components/NavBar";

const MainLayout = ({ children }) => {

  return (
    <div className="flex flex-row h-screen">
      <NavBar/>
      <div className="flex-1 overflow-x-auto flex flex-col">
        <HeadBar/>
        <div id="admin-main-div" className="relative flex-1 overflow-auto flex flex-col justify-between">
          <Suspense fallback={
            <div className="flex-1 grid place-items-center">
              <p className="flex items-center">
                <Spinner height={15} width={15}/>
                <span>Loading...</span>
              </p>
            </div>
          }>
            <div className="py-8 px-6 min-w-[1024px] h-fit">{children}</div>
          </Suspense>
          <div className="text-center min-w-[1024px] py-2 text-gray-400 text-sm">
            ©{new Date().getFullYear()} BookRecaps {import.meta.env.VITE_WEB_NAME}. All rights reserved
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout