import { Suspense } from "react";
import Spinner from "../components/Spinner";
import { HeadBar } from "../components/HeadBar";
import { NavBar } from "../components/NavBar";
import { useNavigation } from "react-router-dom";
import { cn } from "../utils/cn";

const MainLayout = ({ children }) => {
  const navigation = useNavigation();

  return (
    <div className="flex flex-row h-screen">
      <NavBar/>
      <div className="flex-1 overflow-x-auto flex flex-col">
        <HeadBar/>
        <div id="admin-main-div" className="relative flex-1 overflow-auto flex flex-col justify-between bg-gray-50">
          <Suspense fallback={
            <div className="flex-1 grid place-items-center">
              <p className="flex items-center">
                <Spinner height={15} width={15}/>
                <span>Loading...</span>
              </p>
            </div>
          }>
            <div className={cn({
              "py-8 px-6 min-w-[1024px] h-fit": true,
              "cursor-progress": navigation.state === "loading"
            })}>
              {children}
            </div>
          </Suspense>
          <div className="text-center min-w-[1024px] py-2 text-gray-400">
            ©{new Date().getFullYear()} BookRecaps {import.meta.env.VITE_WEB_NAME}. All rights reserved
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout