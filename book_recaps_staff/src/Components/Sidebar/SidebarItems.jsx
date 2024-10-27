import React from "react";

import {
  Home,
  Bookmark,
  SpaceDashboard,
  BorderColor,
  AutoAwesome,
  Settings,
  HelpOutline,
  Logout,
  GifBox,
  LibraryBooks,
  Widgets,
  Notes,
  Groups
} from "@mui/icons-material";

export const SidebarItems = [
  {
    title: "Tổng quan",
    icon: <Widgets />,
    link: "/overview",
  },
  {
    title: "Danh sách Recaps",
    icon: <LibraryBooks />,
    link: "/recaps",
  },
  {
    title: "Quản lý người dùng",
    icon: <Groups />,
    link: "/users",
  },
  {
    title: "Cài đặt",
    icon: <Settings />,
    link: "/settings",
  },
  // {
  //   title: "Đăng xuất",
  //   icon: <Logout />,
  //   link: "/logout",
  // },
];
