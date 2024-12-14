import React from "react";

import {
    Paid,
    LibraryBooks,
    Widgets,
    Groups,
    MenuBook,
    CurrencyExchange,
    People,
    Summarize
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
        title: "Quyết toán cho Người đóng góp",
        icon: <CurrencyExchange />,
        link: "/contributor-payout",
    },
    {
        title: "Quản lý người dùng",
        icon: <Groups />,
        link: "/users",
    },
    {
        title: "Thông tin NXB",
        icon: <People />,
        link: "/publishsers",
    },
    {
        title: "Quản lý sách",
        icon: <MenuBook />,
        link: "/books",
    },
    {
        title: "Giám sát Recap",
        icon: <Summarize />,
        link: "/recaps",
    },
    {
        title: "Quản lý Hợp đồng",
        icon: <LibraryBooks />,
        link: "/contracts",
    },
];
