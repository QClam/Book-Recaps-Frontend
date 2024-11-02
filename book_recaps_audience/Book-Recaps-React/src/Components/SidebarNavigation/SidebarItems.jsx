import React from 'react';

import { Home, Search, LibraryBooks, Person, BorderColor, MenuBook, Settings, HelpOutline, Logout, Category, AutoAwesome  } from '@mui/icons-material';

export const SidebarItems = [
    // {
    //     title: "For You",
    //     icon: <Home />,
    //     link: "/for-you",
    // },
    {
        title: "Explore",
        icon: <Search />,
        link: "/explore",
    },
    {
        title: "Books",
        icon: <MenuBook />,  // Icon cho Books
        link: "/books",
    },
    {
        title: "Categories",  // Thêm title "Categories"
        icon: <Category />,  // Icon Category
        link: "/categories",
    },
    {
        title: "Author",
        icon: <Person />,  // Icon cho Author
        link: "/author",
    },
    {
        title: "Playlist",
        icon: <LibraryBooks />,  // Icon cho Library
        link: "/playlist",
    },
    
    // {
    //     title: "Highlights",
    //     icon: <BorderColor />,
    //     link: "/highlights",
    // },
    {
        title: "Recap",
        icon: <AutoAwesome />,
        link: "/contributor",
    },
    

    
    {
        title: "Settings",
        icon: <Settings />,
        link: "/settings",
    },
    // {
    //     title: "Support",
    //     icon: <HelpOutline />,
    //     link: "/help",
    // },
    // {
    //     title: "Logout",
    //     icon: <Logout />,
    //     link: "/logout",
    // },
];
