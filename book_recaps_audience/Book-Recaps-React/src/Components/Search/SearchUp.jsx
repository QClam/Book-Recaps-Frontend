import React, { useState } from 'react';
import '../Search/SearchUp.scss';

const SearchUp = () => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    Material: [],
  });
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [books, setBooks] = useState([]); // State to store fetched books

  const materials = [
    'Anh', 'Việt', 'Pháp', 'Nga', 'Đức', 'Ý', 'Thái Lan',
    'Nhật', 'Trung', 'TBN'
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
  
    // Xóa kết quả nếu trường tìm kiếm bị xóa (rỗng)
    if (value.trim() === '') {
      setBooks([]); // Clear search results when search input is empty
    }
  };
  

  const toggleFilter = (category, value) => {
    setSelectedFilters((prevFilters) => {
      const updatedCategory = prevFilters[category].includes(value)
        ? prevFilters[category].filter((item) => item !== value)
        : [...prevFilters[category], value];
      return {
        ...prevFilters,
        [category]: updatedCategory,
      };
    });
  };

  const clearFilters = () => {
    setSelectedFilters({
      Material: [],
    });
  };

  const applyFilters = () => {
    const query = searchInput.trim() || ''; // Trim input để xóa khoảng trắng thừa
    if (query === '') {
      console.log('Vui lòng nhập từ khóa tìm kiếm.');
      return;
    }
  
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyB2so12nLWU0PHbITbm65e2HXPKs52ua_c`;
    console.log('API URL:', apiUrl);
  
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Fetched Data:', data);
        if (data.items && data.items.length > 0) {
          setBooks(data.items);
        } else {
          setBooks([]); // Không có kết quả
          console.log('Không có kết quả nào khớp với tìm kiếm');
        }
      })
      .catch((error) => console.error('Error fetching books:', error));
  };
  

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  return (
    <div className="data-filter-container">
      <div className="filter-header">
        {/* <h2>Data Filters</h2> */}
        <input
          type="text"
          value={searchInput}
          onChange={handleSearch}
          onClick={toggleDropdown}
          placeholder="Search filter..."
          className="search-filter-input"
        />
      </div>

      {isDropdownVisible && (
        <div className="filter-content">
          <div className="filter-sidebar">
            <ul>
              <li>Tên sách</li>
              <li>Tác giả</li>
              <li>Thể loại</li>
              <li>Năm xuất bản</li>              
              <li>Số trang</li>
              
              <li className="active">Ngôn ngữ</li>
              <li>Fit</li>
              <li>Occasion</li>
            </ul>
          </div>

          <div className="filter-main">
            <h4>Material</h4>
            <div className="filter-options">
              {materials.map((material) => (
                <label key={material} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedFilters.Material.includes(material)}
                    onChange={() => toggleFilter('Material', material)}
                  />
                  {material}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {isDropdownVisible && (
        <div className="filter-footer">
          <button className="clear-button" onClick={clearFilters}>Clear all</button>
          <div className="results-text">Show {books.length} results</div>
          <button className="apply-button" onClick={applyFilters}>Apply all filters</button>
        </div>
      )}

      {/* Display fetched books */}
      <div className="book-results">
        {books.length > 0 ? (
          books.map((book) => (
            <div key={book.id} className="book-item">
              <h3>{book.volumeInfo.title}</h3>
              <p>{book.volumeInfo.authors?.join(', ')}</p>
              {book.volumeInfo.imageLinks?.thumbnail && (
                <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
              )}
            </div>
          ))
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
};

export default SearchUp;
