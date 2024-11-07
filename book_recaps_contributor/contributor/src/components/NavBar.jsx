import { useState } from "react";
import Show from "./Show";
import { cn } from "../utils/cn";
import { Link, NavLink, useMatch } from "react-router-dom";
import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";
import { TbApps, TbArrowBarLeft, TbArrowBarRight, TbBooks, TbMessage, TbNews, TbUser } from "react-icons/tb";
import { HiOutlineCreditCard } from "react-icons/hi2";
import { routes } from "../routes";

export const NavBar = () => {
  const [ isOpen, setIsOpen ] = useState(true)

  return (
    <section
      className={cn("w-64 h-screen bg-white z-10 overflow-x-hidden flex flex-col items-start border-r border-gray-200 shadow-lg",
        !isOpen && "w-[76px]"
      )}
    >
      <Link
        to={routes.dashboard}
        className="flex justify-start items-center py-2 px-5 gap-2.5 w-full h-16"
      >
        <img src="/icon.png" className="block h-10" alt="logo"/>
        <span className={cn("font-bold text-2xl", !isOpen && "hidden")}>
          Dashboard
        </span>
      </Link>

      <div className="w-full px-[18px] mt-2">
        <button
          onClick={() => setIsOpen((open) => !open)}
          className="flex flex-row items-center p-2.5 gap-2 rounded border border-gray-300 text-lg font-semibold text-gray-600 hover:bg-[#EFEFFD] hover:text-indigo-600">
          {isOpen ? <TbArrowBarLeft/> : <TbArrowBarRight/>}
        </button>
      </div>

      <ul className="w-full flex flex-col items-start gap-2 px-[18px] py-6">
        {/* Dashboard */}
        <NavbarLink
          href={routes.dashboard}
          icon={<TbApps/>}
          text="Dashboard"
          isOpen={isOpen}
          end
        />
        <NavbarLink
          href={routes.recaps}
          icon={<TbNews/>}
          text="Recaps"
          isOpen={isOpen}
        />

        <NavInfo isOpen={isOpen}>
          Resources&nbsp;and&nbsp;help
        </NavInfo>

        <NavbarLink
          href={routes.books}
          icon={<TbBooks/>}
          text="Books"
          isOpen={isOpen}
          end
        />

        <NavbarLink
          href={routes.contact}
          text="Contact"
          icon={<TbMessage/>}
          isOpen={isOpen}
        />

        <NavInfo isOpen={isOpen}>
          Account
        </NavInfo>

        <NavbarLink
          href={routes.profile}
          text="Profile"
          icon={<TbUser/>}
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.billingInvoices}
          text="Billing&nbsp;and&nbsp;invoices"
          icon={<HiOutlineCreditCard/>}
          isOpen={isOpen}
        />
      </ul>
    </section>
  );
};

const NavInfo = (props) => {
  const { isOpen, children } = props;

  return (
    <li className="w-full mt-3">
      <div className="text-gray-400 flex font-semibold leading-[14px] py-2 px-[11px] uppercase">
        <Show when={isOpen} fallback={
          <span className="w-[18px]">&nbsp;</span>
        }>
          <span>{children}</span>
        </Show>
      </div>
    </li>
  )
}

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
        title={text}
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
  const exactMatch = useMatch(href);

  return (
    <>
      <li className="w-full relative">
        <NavLink
          to={href}
          className={({ isActive }) => cn({
            "text-gray-600 flex flex-row items-center py-2 px-[11px] gap-2 rounded w-full font-semibold z-20": true,
            "py-[11px]": !isOpen,
            "bg-[#EFEFFD] text-indigo-600": isDropdownOpen && isOpen,
            "bg-indigo-600 text-white": !!exactMatch || (isActive && (!isOpen || !isDropdownOpen)),
            "hover:bg-[#EFEFFD] hover:text-indigo-600": !isActive,
          })}
          title={text}
        >
          <Show when={icon}>{<span className="text-lg">{icon}</span>}</Show>
          <span className={cn(!isOpen && "hidden")}>{text}</span>
        </NavLink>
        <Show when={isOpen}>
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="rounded p-1 text-lg hover:bg-indigo-300 absolute right-[11px] top-1/2 -translate-y-1/2"
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
