import { useState } from "react";
import Show from "./Show";
import { cn } from "../utils/cn";
import { Link, NavLink } from "react-router-dom";
import { TbApps, TbArrowBarLeft, TbArrowBarRight, TbBooks, TbNews, TbUser } from "react-icons/tb";
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
        to={routes.index}
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
          href={routes.index}
          icon={<TbApps/>}
          text="Tổng quan"
          isOpen={isOpen}
          end
        />

        <NavInfo isOpen={isOpen}>
          Resources
        </NavInfo>

        <NavbarLink
          href={routes.books}
          icon={<TbBooks/>}
          text="Quản lý sách"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.contracts}
          icon={<TbNews/>}
          text="Quản lý hợp đồng"
          isOpen={isOpen}
        />


        <NavInfo isOpen={isOpen}>
          Account
        </NavInfo>

        <NavbarLink
          href={routes.payouts}
          text="Quyết toán"
          icon={<HiOutlineCreditCard/>}
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.settings}
          text="Cài đặt"
          icon={<TbUser/>}
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