import { useRef, useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import Show from "./Show";
import { useClickAway } from "react-use";

export const HeadBar = (props) => {
  const { setIsNavOpen } = props;
  const [ isDropdownOpen, setIsDropdownOpen ] = useState(false);
  const dropdownEl = useRef(null);

  useClickAway(dropdownEl, () => {
    if (isDropdownOpen) setIsDropdownOpen(false);
  });

  const signOut = () => {
    // signOut();
  }

  return (
    <nav
      className="flex flex-row justify-between items-center py-4 px-6 gap-4 h-[72px] bg-white border-b-1 border-gray-200 shadow-md">
      <button onClick={() => setIsNavOpen((open) => !open)} className="p-3 rounded hover:bg-[#EFEFFD]">
        <img alt="nav-button" src="/buger_icon.svg" className="bx bx-menu"></img>
      </button>
      <div className="relative ml-3" ref={dropdownEl}>
        <div className="h-full items-center flex">
          <button
            className="text-sm rounded-full flex items-center justify-center gap-3"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/*<img*/}
            {/*  className="h-8 w-8 rounded-full bg-gray-400"*/}
            {/*  src="/user-avatar.png"*/}
            {/*  alt="Profile Image"*/}
            {/*/>*/}
            <div className="text-start hidden sm:block">
              <p className="font-semibold">Admin</p>
              <p className="text-xs text-gray-500 font-medium">
                Administrator
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
              <button
                onClick={signOut}
                className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </Show>
      </div>
    </nav>
  );
};
