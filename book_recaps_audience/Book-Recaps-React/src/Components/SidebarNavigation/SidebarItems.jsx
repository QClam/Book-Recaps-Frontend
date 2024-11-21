import React from 'react';

import { Home, Search, LibraryBooks, Person, BorderColor, MenuBook, Settings, HelpOutline, Logout, Category, AutoAwesome, History   } from '@mui/icons-material';

export const SidebarItems = [

    {
        title: "Explore",
        icon: <Search />,
        link: "/explore",
    },

    {
        title: "Home",
        icon: <Home />,
        link: "/home",
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
    //     title: "Recap",
    //     icon: <AutoAwesome />,
    //     link: "/contributor",
    // },
    
    {
        title: "History",
        icon: <History  />,
        link: "/history",
    },
    
    {
        title: "Settings",
        icon: <Settings />,
        link: "/settings",
    },
    // {
    //     title: "New",
    //     icon: <HelpOutline />,
    //     link: "/new",
    // },
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
