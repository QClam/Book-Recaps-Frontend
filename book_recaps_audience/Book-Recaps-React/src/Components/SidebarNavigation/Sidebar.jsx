import { useEffect, useMemo, useRef, useState } from "react";
import { generatePath, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "../SidebarNavigation/css/Sidebar.scss";
import { routes } from "../../routes";
import Show from "../Show";
import { useClickAway } from "react-use";
import { useAuth } from "../../contexts/Auth";
import { axiosInstance } from "../../utils/axios";
import { CgClose, CgMenu } from "react-icons/cg";
import { cn } from "../../utils/cn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { TbSearch } from "react-icons/tb";

function Sidebar() {
  let location = useLocation();
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ books, setBooks ] = useState([]);
  const [ showProfileDropDown, setShowProfileDropDown ] = useState(false); // State to manage logout option visibility
  const [ showSearchResultDropDown, setShowSearchResultDropDown ] = useState(false);
  const [ showMobileMenu, setShowMobileMenu ] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const profileDropdownEl = useRef(null);
  const searchResultsDropdownEl = useRef(null);

  const userName = user?.profileData.userName || user?.profileData.fullName || '';
  const imageUrl = user?.profileData.imageUrl.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png';

  useClickAway(profileDropdownEl, () => {
    if (showProfileDropDown) setShowProfileDropDown(false);
  });

  useClickAway(searchResultsDropdownEl, () => {
    if (showSearchResultDropDown) setShowSearchResultDropDown(false);
  });

  useEffect(() => {
    if (showMobileMenu) setShowMobileMenu(false);
    if (showProfileDropDown) setShowProfileDropDown(false);
    if (showSearchResultDropDown) setShowSearchResultDropDown(false);
  }, [ location ]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get('/api/book/getallbooks');
        const data = response.data.data.$values;
        setBooks(data || []);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSearchResultDropDown(true);
  };

  const toggleLogout = () => {
    setShowProfileDropDown(prev => !prev); // Toggle the visibility of the logout option
  };

  const filteredBooks = useMemo(() => {
    const searchStr = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const titleMatch = book.title && book.title.toLowerCase().includes(searchStr);
      const originalTitleMatch = book.originalTitle && book.originalTitle.toLowerCase().includes(searchStr);
      const authorMatch = book.authors.$values && book.authors.$values.some((author) =>
        author.name && author.name.toLowerCase().includes(searchStr)
      );
      return titleMatch || originalTitleMatch || authorMatch;
    });
  }, [ searchTerm ]);

  return (
    <nav className="relative py-2 border-b border-gray-300 z-10">
      <div className="mx-auto max-w-screen-2xl p-2 sm:px-6 lg:px-8">
        <div className="relative flex items-stretch justify-between">
          <div className="absolute inset-y-0 left-2 h-fit flex items-center sm:hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-[#FF6F61]/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              onClick={() => setShowMobileMenu(prev => !prev)}
            >
              <span className="sr-only">Open main menu</span>
              <Show when={showMobileMenu} fallback={<CgMenu size={24}/>}>
                <CgClose size={24}/>
              </Show>
            </button>
          </div>

          <div
            className="h-[inherit] flex flex-1 items-center justify-center flex-col gap-4 lg:flex-row sm:items-stretch sm:justify-between">
            <div className="flex items-center justify-center sm:items-stretch sm:justify-start">
              <Link to={routes.index} className="flex flex-shrink-0 items-center gap-1">
                <img className="h-10 w-auto" src="/logo-transparent.png" alt="Your Company"/>
                <span className="sm:hidden md:inline text-[#FF6F61] font-medium text-lg">BookRecaps</span>
              </Link>

              {/* Nav Links */}
              <div className="hidden sm:ml-7 sm:block -mt-2 -mb-[6px]">
                <div className="flex h-full px-2">
                  <NavLink
                    to={routes.index}
                    className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {
                      "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,
                      "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive
                    })}>
                    Home
                  </NavLink>
                  <NavLink
                    to={routes.explore}
                    className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {
                      "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,
                      "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive
                    })}>
                    Explore
                  </NavLink>
                  <NavLink
                    to={routes.playlist}
                    className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {
                      "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,
                      "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive
                    })}>
                    Playlist
                  </NavLink>


                  <NavLink
                    to={routes.books}
                    className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {
                      "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,
                      "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive
                    })}>
                    Books
                  </NavLink>
                  <NavLink
                    to={routes.categories}
                    className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {
                      "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,
                      "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive
                    })}>
                    Categories
                  </NavLink>
                  <NavLink
                    to={routes.authors}
                    className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {
                      "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,
                      "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive
                    })}>
                    Authors
                  </NavLink>
                </div>
              </div>
            </div>


            <div className="filter-sectionme w-full lg:max-w-lg">
              <div
                className="relative flex items-center w-full rounded-xl border border-gray-300 px-1.5 py-0.5 mx-2"
                ref={searchResultsDropdownEl}
              >
                <input
                  type="search"
                  className="search-inputme"
                  placeholder="Tìm kiếm tác giả hoặc tiêu đề"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchResultDropDown(true)}
                />
                <button type="button" className="search-buttonme text-gray-600">
                  <TbSearch size={20}/>
                </button>
                <Show when={filteredBooks.length > 0 && showSearchResultDropDown}>
                  <ul className="search-results">
                    {filteredBooks.map((book) => (
                      <li key={book.id}>
                        <Link to={generatePath(routes.bookDetail, { id: book.id })} className="search-result-itemem">
                          <div className="book-itemem">
                            <img src={book.coverImage || "defaultCover.jpg"} alt="Book cover" className="book-cover"/>
                            <div className="book-info">
                              <strong>{book.title}</strong>
                              <p>By: {book.authors.$values.map((author) => author.name).join(', ')}</p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Show>
              </div>

              <div className="relative items-center hidden sm:flex" ref={profileDropdownEl}>
                <Show when={isAuthenticated} fallback={
                  <Link to={routes.login} className="login-button">
                    <FontAwesomeIcon icon={faSignInAlt} className="login-icon"/>
                    <span>Login</span>
                  </Link>
                }>
                  <div className="user-profile" onClick={toggleLogout}>
                    <span className="user-name">{userName}</span>
                    <div className="w-8 h-8">
                      <img src={imageUrl} alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
                    </div>
                  </div>
                </Show>

                <Show when={showProfileDropDown}>
                  <div className="logout-option rounded ">
                    <Link
                      className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-[#FF6F61]/20"
                      to={routes.profileSettings}>
                      Profile settings
                    </Link>
                    <Link
                      className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-[#FF6F61]/20"
                      to={routes.viewHistory}>
                      View history
                    </Link>
                    <Link
                      className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-[#FF6F61]/20"
                      to={routes.logout}>
                      Logout
                    </Link>
                  </div>
                </Show>
              </div>
            </div>

          </div>
        </div>
      </div>
      <MobileMenu isOpen={showMobileMenu} setIsOpen={setShowMobileMenu}/>
    </nav>
  );
}

export default Sidebar;

const MobileMenu = ({ isOpen, setIsOpen }) => {
  const menuRef = useRef(null);

  useClickAway(menuRef, () => {
    if (isOpen) setIsOpen(false);
  });

  return (
    <div className={cn("sm:hidden", { "hidden": !isOpen })} ref={menuRef}>
      <div className="space-y-1 px-2 pb-3 pt-2">
        <NavLink
          to={routes.index}
          className={({ isActive }) => cn("text-gray-700 block rounded-md px-3 py-2 text-base font-medium",
            isActive ? "bg-[#FF6F61]/30" : "hover:bg-[#FF6F61]/30")}
        >
          Home
        </NavLink>
        <NavLink
          to={routes.explore}
          className={({ isActive }) => cn("text-gray-700 block rounded-md px-3 py-2 text-base font-medium",
            isActive ? "bg-[#FF6F61]/30" : "hover:bg-[#FF6F61]/30")}
        >
          Explore
        </NavLink>
        <NavLink
          to={routes.playlist}
          className={({ isActive }) => cn("text-gray-700 block rounded-md px-3 py-2 text-base font-medium",
            isActive ? "bg-[#FF6F61]/30" : "hover:bg-[#FF6F61]/30")}
        >
          Playlist
        </NavLink>
        <NavLink
          to={routes.viewHistory}
          className={({ isActive }) => cn("text-gray-700 block rounded-md px-3 py-2 text-base font-medium",
            isActive ? "bg-[#FF6F61]/30" : "hover:bg-[#FF6F61]/30")}
        >
          View history
        </NavLink>
        <NavLink
          to={routes.profileSettings}
          className={({ isActive }) => cn("text-gray-700 block rounded-md px-3 py-2 text-base font-medium",
            isActive ? "bg-[#FF6F61]/30" : "hover:bg-[#FF6F61]/30")}
        >
          Profile settings
        </NavLink>
        <Link
          to={routes.logout}
          className="text-gray-700 block rounded-md px-3 py-2 text-base font-medium hover:bg-[#FF6F61]/30"
        >
          Logout
        </Link>
      </div>
    </div>
  )
}