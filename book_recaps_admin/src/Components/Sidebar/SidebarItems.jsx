import React from "react";

import {
    Home,
    Paid,
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
    Groups,
    MenuBook
} from "@mui/icons-material";

export const SidebarItems = [
    {
        title: "Tổng quan",
        icon: <Widgets />,
        link: "/dashboard",
    },
    {
        title: "Quyết toán",
        icon: <Paid />,
        link: "/publisher-payout",
    },
    {
        title: "Quản lý người dùng",
        icon: <Groups />,
        link: "/users",
    },
    {
        title: "Quản lý sách",
        icon: <MenuBook />,
        link: "/books",
    },
    {
        title: "Doanh thu sách",
        icon: <LibraryBooks />,
        link: "/content",
    },
    {
        title: "Cài đặt",
        icon: <Settings />,
        link: "/settings",
    },
];
