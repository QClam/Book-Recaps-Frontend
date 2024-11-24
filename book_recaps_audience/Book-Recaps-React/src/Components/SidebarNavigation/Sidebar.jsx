import { useEffect, useMemo, useRef, useState } from "react";
import { generatePath, Link, useNavigate } from "react-router-dom";
import JKROW from "../../image/jkrow.jpg";
import { SidebarItems } from "./SidebarItems";
import "../SidebarNavigation/css/Sidebar.scss";
import bookRecap from '../../image/removeBR.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSearch, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { routes } from "../../routes";
import Show from "../Show";
import { useClickAway } from "react-use";
import { useAuth } from "../../contexts/Auth";
import { axiosInstance } from "../../utils/axios";

function Sidebar() {
  const navigate = useNavigate();
  const [ searchTerm, setSearchTerm ] = useState('');
  const [ books, setBooks ] = useState([]);
  const [ showProfileDropDown, setShowProfileDropDown ] = useState(false); // State to manage logout option visibility
  const [ showSearchResultDropDown, setShowSearchResultDropDown ] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const profileDropdownEl = useRef(null);
  const searchResultsDropdownEl = useRef(null);

  const userName = user?.profileData.userName || user?.profileData.fullName || '';
  const imageUrl = user?.profileData.imageUrl || JKROW;

  useClickAway(profileDropdownEl, () => {
    if (showProfileDropDown) setShowProfileDropDown(false);
  });

  useClickAway(searchResultsDropdownEl, () => {
    if (showSearchResultDropDown) setShowSearchResultDropDown(false);
  });

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
    <div className="Sidebar">
      <div className="Sidebar-bar">
        <div className="SidebarLogo">
          <img src={bookRecap} alt="Logo"/>
        </div>

        <ul className="SidebarList">
          {SidebarItems.map((val, key) => (
            <li
              key={key}
              onClick={() => navigate(val.link)}
              className={`row ${window.location.pathname === val.link ? "active" : ""}`}
            >
              <div id="icon">{val.icon}</div>
              <div id="title">{val.title}</div>
            </li>
          ))}
        </ul>

        <div className="filter-sectionme">
          <div className="search-formme" ref={searchResultsDropdownEl}>
            <input
              type="search"
              className="search-inputme"
              placeholder="Tìm kiếm theo tác giả hoặc tiêu đề"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchResultDropDown(true)}
            />
            <button type="button" className="search-buttonme">
              <FontAwesomeIcon icon={faSearch}/>
            </button>
            <Show when={filteredBooks.length > 0 && showSearchResultDropDown}>
              <ul className="search-results">
                {filteredBooks.map((book) => (
                  <li key={book.id}>
                    <Link to={generatePath(routes.book, { id: book.id })} className="search-result-itemem">
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

          <div className="user-info" ref={profileDropdownEl}>
            <FontAwesomeIcon icon={faBell} className="iconHeader"/>

            {/* Chỉ hiển thị nút Login nếu chưa đăng nhập */}
            {/* Thay vì dùng button, bạn dùng div hoặc span */}
            <Show when={isAuthenticated} fallback={
              <div onClick={() => navigate("/login")} className="login-button">
                <FontAwesomeIcon icon={faSignInAlt} className="login-icon"/> {/* Sử dụng FontAwesome icon */}
                <span>Login</span>
              </div>
            }>
              <div className="user-profile" onClick={toggleLogout}>
                <span className="user-name">{userName}</span>
                <img src={imageUrl} alt="User Avatar" className="user-avatar"/>
              </div>
            </Show>

            <Show when={showProfileDropDown}>
              <div className="logout-option">
                <Link to={routes.profileSettings}>Profile settings</Link>
                <Link to={routes.viewHistory}>View history</Link>
                <Link to={routes.logout}>Logout</Link>
              </div>
            </Show>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Sidebar;
