import { Category, Home, LibraryBooks, MenuBook, Person, Search } from '@mui/icons-material';
import { routes } from "../../routes";

export const SidebarItems = [
  {
    title: "Explore",
    icon: <Search/>,
    link: "/explore",
  },
  {
    title: "Home",
    icon: <Home/>,
    link: routes.index,
  },
  {
    title: "Books",
    icon: <MenuBook/>,  // Icon cho Books
    link: "/books",
  },
  {
    title: "Categories",  // Thêm title "Categories"
    icon: <Category/>,  // Icon Category
    link: "/categories",
  },
  {
    title: "Author",
    icon: <Person/>,  // Icon cho Author
    link: "/author",
  },
  {
    title: "Playlist",
    icon: <LibraryBooks/>,  // Icon cho Library
    link: "/playlist",
  },

  // {
  //     title: "Recap",
  //     icon: <AutoAwesome />,
  //     link: "/contributor",
  // },

  // {
  //     title: "History",
  //     icon: <History  />,
  //     link: "/history",
  // },
  //
  // {
  //     title: "Settings",
  //     icon: <Settings />,
  //     link: "/settings",
  // },
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
