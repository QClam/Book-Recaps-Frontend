import React, { useState }  from 'react';
import './Dashboard.scss';
import BookTable from '../ListBook/BookTable/BookTable';


const Dashboard = () => {
  const [booksToShow, setBooksToShow] = useState(10); // Số sách mặc định là 10

  const handleSelectChange = (event) => {
    const value = event.target.value === "All" ? "All" : parseInt(event.target.value);
    setBooksToShow(value);
  };

  return (
    <div className="dashboard">
      <div className="performance-overview">
        <div className="overview-card">
          <p>Thu nhập</p>
          <h3>-- VND</h3>
          <span>Tháng trước</span>
          <i className="icon-chart"></i>
        </div>
        <div className="overview-card">
          <p>Số bài viết mới</p>
          <h3>--</h3>
          <span>Tháng trước</span>
          <i className="icon-posts"></i>
        </div>
        <div className="overview-card">
          <p>Lượt xem</p>
          <h3>--</h3>
          <span>Tháng trước</span>
          <i className="icon-views"></i>
        </div>
      </div>

      <div className="books-section">
        <div className="books-header">
          <h3>Books</h3>
          <select onChange={handleSelectChange} className="books-select">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="60">60</option>
            <option value="All">All Books</option>
          </select>
        </div>
        <BookTable booksToShow={booksToShow} />
      </div>
    </div>
  );
};

export default Dashboard;

