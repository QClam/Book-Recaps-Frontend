import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../SidebarNavigation/Sidebar';
import '../Search/Filter.scss';
import JKROW from "../../image/jkrow.jpg";

const Filter = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="filter-sidebar-container">
            <Sidebar />
            <div className="filter-section">
                <form className="search-form" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by author or title"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button type="submit" className="search-button">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </form>

                <div className="user-info">
                    <FontAwesomeIcon icon={faBell} className="iconHeader" />
                    <FontAwesomeIcon icon={faEnvelope} className="iconHeader" />
                    <div className="user-profile">
                        <span className="user-name">Abhishek Saha</span>
                        <img src={JKROW} alt="User Avatar" className="user-avatar" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Filter;
