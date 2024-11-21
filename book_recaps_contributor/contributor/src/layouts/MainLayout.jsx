import { Suspense } from "react";
import Spinner from "../components/Spinner";
import { HeadBar } from "../components/HeadBar";
import { NavBar } from "../components/NavBar";
import { useMatch, useNavigation } from "react-router-dom";
import { cn } from "../utils/cn";
import { routes } from "../routes";
import Show from "../components/Show";

const MainLayout = ({ children }) => {
  const navigation = useNavigation();

  const matchRecapVersionDetails = useMatch(routes.recapVersionDetails);
  const matchRecapDetails = useMatch(routes.recapDetails);
  const matchCreateRecap = useMatch(routes.createRecap);

  const isOffFooter = matchRecapVersionDetails || (matchRecapDetails && !matchCreateRecap);

  return (
    <div className="flex flex-row h-screen">
      <NavBar/>
      <div className="flex-1 overflow-x-auto flex flex-col">
        <HeadBar/>
        <div
          id="admin-main-div"
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
            <div className={cn({
              "min-w-[1024px]": true,
              "pb-8 px-6 h-fit": !isOffFooter,
              "flex-1": isOffFooter
            })}>
              {children}
            </div>
          </Suspense>
          <Show when={!isOffFooter}>
            <div className="text-center min-w-[1024px] py-2 text-gray-400">
              ©{new Date().getFullYear()} BookRecaps {import.meta.env.VITE_WEB_NAME}. All rights reserved
            </div>
          </Show>
        </div>
      </div>
    </div>
  )
}

export default MainLayout