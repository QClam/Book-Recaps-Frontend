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
    MenuBook,
    CurrencyExchange
} from "@mui/icons-material";

export const SidebarItems = [
    {
        title: "Tổng quan",
        icon: <Widgets />,
        link: "/dashboard",
    },
    {
        title: "Quyết toán cho NXB",
        icon: <Paid />,
        link: "/publisher-payout",
    },
    {
        title: "Quyết toán cho Contributor",
        icon: <CurrencyExchange />,
        link: "/contributor-payout",
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
        title: "Hợp đồng",
        icon: <LibraryBooks />,
        link: "/contracts",
    },
    {
        title: "Cài đặt",
        icon: <Settings />,
        link: "/settings",
    },
];
