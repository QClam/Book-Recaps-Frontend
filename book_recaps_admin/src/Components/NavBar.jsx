import { useState } from "react";
import Show from "./Show";
import { cn } from "../utils/cn";
import { Link, NavLink } from "react-router-dom";
import {
  TbApps,
  TbArrowBarLeft,
  TbArrowBarRight,
  TbBooks,
  TbContract,
  TbNews,
  TbUserEdit,
  TbUsers,
  TbUserStar
} from "react-icons/tb";
import { routes } from "../routes";
import { LuBookUser } from "react-icons/lu";

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
          Admin
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
          text="Tổng quan"
          isOpen={isOpen}
          end
        />

        <NavInfo isOpen={isOpen}>
          Quyết toán
        </NavInfo>

        <NavbarLink
          href={routes.publisherPayout}
          icon={<TbUserStar/>}
          text="Nhà xuất bản"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.contributorPayout}
          icon={<TbUserEdit/>}
          text="Người đóng góp"
          isOpen={isOpen}
        />

        <NavInfo isOpen={isOpen}>
          Quản lý
        </NavInfo>

        <NavbarLink
          href={routes.users}
          icon={<TbUsers/>}
          text="Người dùng"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.publishers}
          icon={<LuBookUser/>}
          text="Thông tin NXB"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.books}
          icon={<TbBooks/>}
          text="Sách"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.contracts}
          icon={<TbContract/>}
          text="Hợp đồng"
          isOpen={isOpen}
        />

        <NavbarLink
          href={routes.recaps}
          icon={<TbNews/>}
          text="Bài viết Recap"
          isOpen={isOpen}
        />

        {/*<NavInfo isOpen={isOpen}>*/}
        {/*  Tài khoản*/}
        {/*</NavInfo>*/}

        {/*<NavbarLink*/}
        {/*  href={routes.logout}*/}
        {/*  icon={<TbLogout/>}*/}
        {/*  text="Đăng xuất"*/}
        {/*  isOpen={isOpen}*/}
        {/*/>*/}
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