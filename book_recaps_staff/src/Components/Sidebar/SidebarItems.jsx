import React from "react";

import {
  OutlinedFlag,
  SpaceDashboard,
  LibraryBooks,
  Gavel,
  Groups,
  CurrencyExchange
} from "@mui/icons-material";

export const SidebarItems = [
  // {
  //   title: "Tổng quan",
  //   icon: <SpaceDashboard />,
  //   link: "/dashboard",
  // },
  // {
  //   title: "Nội dung chờ duyệt",
  //   icon: <Widgets />,
  //   link: "/overview",
  // },
  {
    title: "Danh sách Recaps",
    icon: <LibraryBooks />,
    link: "/recaps",
  },
  {
    title: "Giám sát người đóng góp",
    icon: <Groups />,
    link: "/users",
  },
  {
    title: "Kháng cáo",
    icon: <Gavel />,
    link: "/appeals",
  },
  {
    title: "Phản hồi",
    icon: <OutlinedFlag />,
    link: "/reports",
  },
  {
    title: "Quản lý rút tiền",
    icon: <CurrencyExchange />,
    link: "/withdrawl",
  },
];
