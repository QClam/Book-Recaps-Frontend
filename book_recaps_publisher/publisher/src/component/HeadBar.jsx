import { useRef, useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import Show from "./Show";
import { useClickAway } from "react-use";
import { Link, useLocation } from "react-router-dom";
import { routes } from "../routes";
import { useAuth } from "../contexts/Auth";

export const HeadBar = () => {
  const location = useLocation();
  const [ isDropdownOpen, setIsDropdownOpen ] = useState(false);
  const { user } = useAuth()
  const dropdownEl = useRef(null);

  const imageUrl = user?.profileData.imageUrl?.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png';

  useClickAway(dropdownEl, () => {
    if (isDropdownOpen) setIsDropdownOpen(false);
  });

  return (
    <nav
      className="flex flex-row justify-between items-center py-4 px-6 gap-4 h-[72px] bg-white border-b border-gray-200 shadow-md">
      <div></div>
      <div className="relative ml-3" ref={dropdownEl}>
        <div className="h-full items-center flex">
          <button
            className="rounded-full flex items-center justify-center gap-3"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-10 h-10">
              <img src={imageUrl} alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
            </div>
            <div className="text-start hidden sm:block">
              <p className="font-semibold">{user.publisherData.publisherName || user.name}</p>
              <p className="text-sm text-gray-500 font-medium">
                {user.role}
              </p>
            </div>
            <span className="text-lg hidden sm:block">
              <Show
                when={!isDropdownOpen}
                fallback={<RiArrowUpSLine/>}
              >
                <RiArrowDownSLine/>
              </Show>
            </span>
          </button>
        </div>
        <Show when={isDropdownOpen}>
          <div
            className="origin-top-right absolute right-0 top-12 z-30 w-48 rounded-md shadow-lg border border-gray-200">
          <div className="py-1 rounded-md bg-white shadow-xs">
              <Link
                to={routes.logout}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                state={{ from: location.pathname }}
              >
                Logout
              </Link>
            </div>
          </div>
        </Show>
      </div>
    </nav>
  );
};
