import { useEffect, useMemo, useRef, useState } from "react";
import { generatePath, Link, NavLink, useLocation } from "react-router-dom";
import "../SidebarNavigation/css/Sidebar.scss";
import { routes } from "../../routes";
import Show from "../Show";
import { useClickAway } from "react-use";
import { useAuth } from "../../contexts/Auth";
import { axiosInstance } from "../../utils/axios";
import { CgClose, CgMenu } from "react-icons/cg";
import { cn } from "../../utils/cn";
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
  const imageUrl = user?.profileData.imageUrl?.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png';
  const activeSubscription = user?.profileData.subscriptions.$values.find((sub) => sub.status === 0);
  const isPremium = !!activeSubscription;

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
        const response = await axiosInstance.get('/api/book/getallbookswithcontract');
        const data = response.data.data?.$values || [];
        setBooks(data);
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

  const handleSearchClear = () => {
    setSearchTerm('');
    setShowSearchResultDropDown(false);
  }

  const toggleLogout = () => {
    setShowProfileDropDown(prev => !prev); // Toggle the visibility of the logout option
  };

  const filteredBooks = useMemo(() => {
    const searchStr = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const titleMatch = book.title && book.title.toLowerCase().includes(searchStr);
      const originalTitleMatch = book.originalTitle && book.originalTitle.toLowerCase().includes(searchStr);
      const authorMatch = book.authorNames?.$values && book.authorNames.$values.some((name) =>
        name.toLowerCase().includes(searchStr)
      );
      return titleMatch || originalTitleMatch || authorMatch;
    });
  }, [ books, searchTerm ]);

  return (
    <nav className="relative py-2 border-b border-gray-300 z-10">
      <div className="mx-auto max-w-screen-xl p-2 sm:px-6 lg:px-8">
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
                    Trang chủ
                  </NavLink>
                  <NavLink
                    to={routes.explore}
                    className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {
                      "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,
                      "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive
                    })}>
                    Tìm sách
                  </NavLink>

                  {/*<NavLink*/}
                  {/*  to={routes.books}*/}
                  {/*  className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {*/}
                  {/*    "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,*/}
                  {/*    "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive*/}
                  {/*  })}>*/}
                  {/*  Books*/}
                  {/*</NavLink>*/}
                  {/*<NavLink*/}
                  {/*  to={routes.categories}*/}
                  {/*  className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {*/}
                  {/*    "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,*/}
                  {/*    "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive*/}
                  {/*  })}>*/}
                  {/*  Thể loại*/}
                  {/*</NavLink>*/}
                  {/*<NavLink*/}
                  {/*  to={routes.authors}*/}
                  {/*  className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {*/}
                  {/*    "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,*/}
                  {/*    "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive*/}
                  {/*  })}>*/}
                  {/*  Tác giả*/}
                  {/*</NavLink>*/}

                  <Show when={isAuthenticated}>
                    <NavLink
                      to={routes.playlist}
                      className={({ isActive }) => cn("grid place-items-center h-full mt-0.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium", {
                        "!border-[#FF6F61] text-[#FF6F61] cursor-default": isActive,
                        "hover:border-[#FF6F61] hover:text-[#FF6F61]": !isActive
                      })}>
                      Danh sách đã lưu
                    </NavLink>
                  </Show>
                </div>
              </div>
            </div>


            <div className="filter-sectionme w-full lg:max-w-lg">
              <div
                className="relative flex items-center w-full rounded-xl border border-gray-300 px-1.5 py-0.5 mx-2"
                ref={searchResultsDropdownEl}
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="search-inputme text-sm"
                    placeholder="Tìm kiếm tác giả hoặc tiêu đề"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSearchResultDropDown(true)}
                  />
                  <Show when={searchTerm}>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600"
                      onClick={handleSearchClear}
                    >
                      <CgClose size={20}/>
                    </button>
                  </Show>
                </div>
                <div className="search-buttonme text-gray-600">
                  <TbSearch size={20}/>
                </div>
                <Show when={filteredBooks.length > 0 && showSearchResultDropDown}>
                  <ul className="search-results">
                    {filteredBooks.map((book) => (
                      <li key={book.id}>
                        <Link to={generatePath(routes.bookDetail, { id: book.id })} className="search-result-itemem">
                          <div className="book-itemem">
                            <img src={book.coverImage || "/empty-image.jpg"} alt="Book cover" className="book-cover"/>
                            <div className="book-info">
                              <strong>{book.title}</strong>
                              <p>By: {book.authorNames?.$values.join(', ')}</p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Show>
              </div>

              <div className="relative items-center ml-2 hidden sm:flex" ref={profileDropdownEl}>
                <Show when={isAuthenticated} fallback={
                  <div className="flex items-center gap-4">
                    <Link
                      to={routes.login}
                      state={{ from: location.pathname }}
                      className="block w-max p-2 border border-[#FF6F61] rounded-md text-sm font-semibold text-[#FF6F61] hover:text-[#FF6F61]/80">
                      Đăng nhập
                    </Link>
                    <Link
                      to={routes.login}
                      state={{ isRegister: true }}
                      className="block w-max p-2 border border-[#FF6F61] rounded-md text-sm font-semibold text-white bg-[#FF6F61] hover:bg-[#FF6F61]/80">
                      Đăng ký
                    </Link>
                  </div>
                }>
                  <div className="user-profile" onClick={toggleLogout}>
                    <div className="text-sm">
                      <p className="font-semibold">{userName}</p>
                      <p className={cn("text-xs rounded-full px-2 py-0.5 w-max", {
                        "bg-[#FF6F61] text-white": isPremium,
                        "bg-gray-300 text-gray-700": !isPremium
                      })}>
                        {isPremium ?
                          <>Premium <strong>({activeSubscription.expectedViewsCount - activeSubscription.actualViewsCount}/{activeSubscription.expectedViewsCount})</strong></> :
                          "Miễn phí"}
                      </p>
                    </div>
                    <div className="w-10 h-10">
                      <img src={imageUrl} alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
                    </div>
                  </div>
                </Show>

                <Show when={showProfileDropDown}>
                  <div className="logout-option rounded">
                    <Link
                      className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-[#FF6F61]/20 decoration-0"
                      to={routes.viewHistory}>
                      Lịch sử xem
                    </Link>
                    <Link
                      className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-[#FF6F61]/20 decoration-0"
                      to={routes.subscriptionHistory}>
                      Lịch sử đăng ký gói
                    </Link>
                    <Link
                      className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-[#FF6F61]/20 decoration-0"
                      to={routes.supportTickets}>
                      Lịch sử báo cáo
                    </Link>
                    <Link
                      className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-[#FF6F61]/20 decoration-0"
                      to={routes.profileSettings}>
                      Cài đặt tài khoản
                    </Link>
                    <Link
                      className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-[#FF6F61]/20 decoration-0"
                      to={routes.becomeContributor}>
                      Trở thành contributor
                    </Link>
                    <Link
                      className="block px-3 py-2 text-sm text-gray-700 rounded-sm hover:bg-[#FF6F61]/20 decoration-0"
                      to={routes.logout}
                      state={{ from: location.pathname }}>
                      Đăng xuất
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
  const location = useLocation();
  const menuRef = useRef(null);
  const { isAuthenticated } = useAuth();

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
          Trang chủ
        </NavLink>
        <NavLink
          to={routes.explore}
          className={({ isActive }) => cn("text-gray-700 block rounded-md px-3 py-2 text-base font-medium",
            isActive ? "bg-[#FF6F61]/30" : "hover:bg-[#FF6F61]/30")}
        >
          Tìm sách
        </NavLink>
        <Show when={isAuthenticated} fallback={
          <>
            <Link
              to={routes.login}
              className="text-gray-700 block rounded-md px-3 py-2 text-base font-medium hover:bg-[#FF6F61]/30"
              state={{ from: location.pathname }}
            >
              Đăng nhập
            </Link>
            <Link
              to={routes.login}
              state={{ isRegister: true }}
              className="text-gray-700 block rounded-md px-3 py-2 text-base font-medium hover:bg-[#FF6F61]/30"
            >
              Đăng ký
            </Link>
          </>
        }>
          <NavLink
            to={routes.playlist}
            className={({ isActive }) => cn("text-gray-700 block rounded-md px-3 py-2 text-base font-medium",
              isActive ? "bg-[#FF6F61]/30" : "hover:bg-[#FF6F61]/30")}
          >
            Danh sách phát
          </NavLink>
          <NavLink
            to={routes.viewHistory}
            className={({ isActive }) => cn("text-gray-700 block rounded-md px-3 py-2 text-base font-medium",
              isActive ? "bg-[#FF6F61]/30" : "hover:bg-[#FF6F61]/30")}
          >
            Lịch sử xem
          </NavLink>
          <NavLink
            to={routes.profileSettings}
            className={({ isActive }) => cn("text-gray-700 block rounded-md px-3 py-2 text-base font-medium",
              isActive ? "bg-[#FF6F61]/30" : "hover:bg-[#FF6F61]/30")}
          >
            Tài khoản
          </NavLink>
          <Link
            to={routes.logout}
            className="text-gray-700 block rounded-md px-3 py-2 text-base font-medium hover:bg-[#FF6F61]/30"
            state={{ from: location.pathname }}
          >
            Đăng xuất
          </Link>
        </Show>
      </div>
    </div>
  )
}