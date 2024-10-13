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
        title: "Quản lý người dùng",
        icon: <Groups />,
        link: "/users",
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
