import { useState } from "react";
import Show from "./Show";
import { cn } from "../utils/cn";
import { Link, NavLink } from "react-router-dom";
import { TbArrowBarLeft, TbArrowBarRight, TbLogout, TbMessage, TbMessageReport, TbNews, TbUsers } from "react-icons/tb";
import { routes } from "../routes";
import { GrMoney } from "react-icons/gr";

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
          Staff
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

        <NavInfo isOpen={isOpen}>
          Quản lý
        </NavInfo>

        <NavbarLink
          href={routes.recaps}
          icon={<TbNews/>}
          text="Duyệt bài viết"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.users}
          icon={<TbUsers/>}
          text="Contributors"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.appeals}
          icon={<TbMessage/>}
          text="Kháng cáo"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.reports}
          icon={<TbMessageReport/>}
          text="Báo cáo"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.withdrawals}
          icon={<GrMoney/>}
          text="Yêu cầu rút tiền"
          isOpen={isOpen}
        />

        <NavInfo isOpen={isOpen}>
          Tài khoản
        </NavInfo>

        <NavbarLink
          href={routes.logout}
          icon={<TbLogout/>}
          text="Đăng xuất"
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