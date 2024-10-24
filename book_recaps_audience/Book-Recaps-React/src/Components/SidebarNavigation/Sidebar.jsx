import React, { useState, useEffect } from "react";  
import { useNavigate } from "react-router-dom";
import JKROW from "../../image/jkrow.jpg";
import { SidebarItems } from "./SidebarItems";
import "../SidebarNavigation/css/Sidebar.scss";
import bookRecap from '../../image/removeBR.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell } from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showLogout, setShowLogout] = useState(false); // State to manage logout option visibility
  const [userName, setUserName] = useState(''); // State for user's name
  const [imageUrl, setImageUrl] = useState(''); // State for user's avatar image URL

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBookClick = (id) => {
    // Navigate to the book detail page
    navigate(`/user-recap-detail/${id}`);
    setSearchTerm(''); // Clear search term
    setFilteredBooks([]); // Clear filtered results
  };

  const handleLogout = () => {
    // Perform logout logic here (e.g., clear tokens, redirect to login page)
    localStorage.removeItem('authToken'); // Example: remove auth token
    navigate('/login'); // Redirect to login page
    console.log("Logout successful"); // Log success
  };

  const toggleLogout = () => {
    setShowLogout(prev => !prev); // Toggle the visibility of the logout option
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const accessToken = localStorage.getItem('authToken');
      try {
        const response = await fetch('https://160.25.80.100:7124/api/personal/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        // Update user name and image URL from the fetched data
        setUserName(data.userName || data.fullName || ''); // Fallback to fullName if userName is not available
        setImageUrl(data.imageUrl || JKROW); // Use the imageUrl or fallback to JKROW
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);


  useEffect(() => {
    const fetchBooks = async () => {
      const accessToken = localStorage.getItem('authToken');
      try {
        const response = await fetch('https://160.25.80.100:7124/api/book/getallbooks', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        if (searchTerm.trim()) {
          const filtered = data.data.$values.filter((book) => {
            const titleMatch = book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase());
            const authorMatch = book.authors.$values && book.authors.$values.some((author) =>
              author.name && author.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return titleMatch || authorMatch;
          });
          setFilteredBooks(filtered);
        } else {
          setFilteredBooks([]);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, [searchTerm]);

  return (
    <div className="Sidebar">
      <div className="Sidebar-bar">
        <div className="SidebarLogo">
          <img src={bookRecap} alt="Logo" />
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
          <form className="search-formme">
            <input
              type="text"
              className="search-inputme"
              placeholder="Tìm kiếm theo tác giả hoặc tiêu đề"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button type="button" className="search-buttonme">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>

          {filteredBooks.length > 0 && (
            <ul className="search-results">
              {filteredBooks.map((book) => (
                <li 
                  key={book.id} 
                  className="search-result-itemem"
                  onClick={() => handleBookClick(book.id)}
                >
                  <div className="book-itemem">
                    <img src={book.coverImage || "defaultCover.jpg"} alt="Book cover" className="book-cover" />
                    <div className="book-info">
                      <strong>{book.title}</strong>
                      <p>By: {book.authors.$values.map((author) => author.name).join(', ')}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="user-info">
            <FontAwesomeIcon icon={faBell} className="iconHeader" />
            <div className="user-profile" onClick={toggleLogout}> {/* Toggle logout on avatar click */}
            <span className="user-name">{userName}</span> {/* Dynamic user name */}
              <img src={imageUrl ? `https://160.25.80.100:7124/${imageUrl}` : JKROW} alt="User Avatar" className="user-avatar" /> {/* Dynamic user avatar */}

            </div>
            {showLogout && (
              <div className="logout-option"> {/* Conditionally render the logout option */}
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
