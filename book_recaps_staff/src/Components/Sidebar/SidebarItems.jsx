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
  Gavel,
  Groups
} from "@mui/icons-material";

export const SidebarItems = [
  {
    title: "Tổng quan",
    icon: <SpaceDashboard />,
    link: "/dashboard",
  },
  {
    title: "Nội dung chờ duyệt",
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
    title: "Kháng cáo",
    icon: <Gavel />,
    link: "/appeal",
  },
  {
    title: "Cài đặt",
    icon: <Settings />,
    link: "/settings",
  },
];
