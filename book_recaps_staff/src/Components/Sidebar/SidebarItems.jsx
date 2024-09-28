import React from "react";

import {
  Home,
  Search,
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
  Notes
} from "@mui/icons-material";

export const SidebarItems = [
  {
    title: "Tổng quan",
    icon: <Widgets />,
    link: "/overview",
  },
  {
    title: "Danh sách nội dung",
    icon: <LibraryBooks />,
    link: "/content",
  },
  {
    title: "Note",
    icon: <Notes />,
    link: "/note",
  },
  {
    title: "Cài đặt",
    icon: <Settings />,
    link: "/settings",
  },
  {
    title: "Đăng xuất",
    icon: <Logout />,
    link: "/logout",
  },
];
