import { useState } from "react";
import Show from "./Show";
import { cn } from "../utils/cn";
import { Link, NavLink } from "react-router-dom";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { TbApps, TbBooks, TbMessage, TbNews } from "react-icons/tb";
import { routes } from "../routes";

export const NavBar = (props) => {
  const { isOpen } = props;

  return (
    <section
      className={cn("w-64 h-screen bg-white z-10 overflow-x-hidden flex flex-col items-start border-r-1 border-gray-200 shadow-lg",
        !isOpen && "w-[76px]"
      )}
    >
      <Link
        to={routes.dashboard}
        className="flex justify-start items-center py-2 px-5 gap-2.5 w-full h-16"
      >
        <img src="/minimal-icon.svg" className="block h-8" alt="logo"/>
        <span className={cn("font-bold text-2xl", !isOpen && "hidden")}>
          Dashboard
        </span>
      </Link>
      <ul className="w-full flex flex-col items-start gap-2 px-[18px] py-6">
        {/* Dashboard */}
        <NavbarLink
          href={routes.dashboard}
          icon={<TbApps/>}
          text="Dashboard"
          isOpen={isOpen}
          end
        />
        <NavbarDropDown
          href={routes.draftRecaps}
          isOpen={isOpen}
          icon={<TbNews/>}
          text="Recaps"
        >
          <NavbarLink
            href={routes.draftRecaps}
            text="Drafts"
            isOpen={isOpen}
            end
          />
          <NavbarLink
            href={routes.underRevisionRecaps}
            text="Under&nbsp;revision"
            isOpen={isOpen}
          />
          <NavbarLink
            href={routes.rejectionsRecaps}
            text="Rejections"
            isOpen={isOpen}
          />
          <NavbarLink
            href={routes.publishedRecaps}
            text="Published"
            isOpen={isOpen}
          />
        </NavbarDropDown>

        <NavbarDropDown
          href={routes.books}
          icon={<TbBooks/>}
          text="Books"
          isOpen={isOpen}
          // defaultOpen={false}
        >
          <NavbarLink
            href={routes.books}
            text="Posts"
            isOpen={isOpen}
            end
          />
          {/*<NavbarLink*/}
          {/*  href={"/"}*/}
          {/*  text="Categories"*/}
          {/*  isOpen={isOpen}*/}
          {/*/>*/}
        </NavbarDropDown>

        <NavbarLink
          href={routes.supportTickets}
          text="Support&nbsp;Tickets"
          icon={<TbMessage/>}
          isOpen={isOpen}
        />
      </ul>
    </section>
  );
};

const NavbarLink = (props) => {
  const { href, isOpen, icon, text, end } = props;

  return (
    <li className="w-full">
      <NavLink
        to={href}
        className={({ isActive }) =>
          cn("flex flex-row items-center py-2 px-[11px] gap-2 rounded w-full font-semibold",
            !isOpen && "py-[11px]",
            isActive ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-[#EFEFFD] hover:text-indigo-600")
        }
        end={end}
      >
        <Show when={icon} fallback={<span className="w-[18px]"></span>}>
          {<span className="text-lg">{icon}</span>}
        </Show>
        <Show when={isOpen}>
          <span>{text}</span>
        </Show>
      </NavLink>
    </li>
  );
};

const NavbarDropDown = (props) => {
  const { href, isOpen, icon, text, defaultOpen } = props;
  const [ isDropdownOpen, setDropdownOpen ] = useState(defaultOpen === undefined ? true : defaultOpen);

  return (
    <>
      <li className="w-full relative">
        <NavLink
          to={href}
          className={({ isActive }) => cn({
            "text-gray-600 flex flex-row items-center py-2 px-[11px] gap-2 rounded w-full font-semibold z-20": true,
            "py-[11px]": !isOpen,
            "bg-[#EFEFFD] text-indigo-600": isDropdownOpen && isOpen,
            "bg-indigo-600 text-white": isActive && (!isOpen || !isDropdownOpen),
            "hover:bg-[#EFEFFD] hover:text-indigo-600": !isActive,
          })}
        >
          <Show when={icon}>{<span className="text-lg">{icon}</span>}</Show>
          <span className={cn(!isOpen && "hidden")}>{text}</span>
        </NavLink>
        <Show when={isOpen}>
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="rounded text-lg hover:bg-indigo-300 absolute right-[11px] top-1/2 -translate-y-1/2"
          >
              <span className="text-lg">
                <Show
                  when={!isDropdownOpen}
                  fallback={<RiArrowUpSLine/>}
                >
                  <RiArrowDownSLine/>
                </Show>
              </span>
          </button>
        </Show>
      </li>
      <Show when={isOpen && isDropdownOpen}>{props.children}</Show>
    </>
  );
};
