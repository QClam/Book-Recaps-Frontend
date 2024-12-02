import React, { useState, useEffect } from 'react'; 
import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';
import emptyImage from "../../assets/empty-image.png";

const Dashboard = ( ) => {
  const [books, setBooks] = useState([]); // Danh sách sách
  const [booksToShow, setBooksToShow] = useState(10); // Số sách muốn hiển thị
  const [income, setIncome] = useState('--');
  const [newPosts, setNewPosts] = useState('--');
  const [views, setViews] = useState('--');
  const accessToken = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const [incomeLastMonth, setIncomeLastMonth] = useState('--');
const [newPostsLastMonth, setNewPostsLastMonth] = useState('--');
const [viewsLastMonth, setViewsLastMonth] = useState('--');

  const handleRowClick = (bookId, totalEarnings) => {
    navigate(`/book-dashboard/${bookId}`, { state: { totalEarnings } }); // Điều hướng kèm bookId
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin hồ sơ
        const profileResponse = await fetch('https://bookrecaps.cloud/api/personal/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (!profileResponse.ok) throw new Error("Failed to fetch profile data");
        const profileData = await profileResponse.json();
        const profileId = profileData?.id;

        // Lấy thông tin nhà xuất bản
        const publisherResponse = await fetch(
          `https://bookrecaps.cloud/api/publisher/getbypublisheruser/${profileId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!publisherResponse.ok) throw new Error("Failed to fetch publisher data");
        const publisherData = await publisherResponse.json();
        const publisherId = publisherData?.id;

        // Lấy dữ liệu bảng điều khiển
        const dashboardResponse = await fetch(
          `https://bookrecaps.cloud/api/dashboard/publisherdashboard/${publisherId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!dashboardResponse.ok) throw new Error("Failed to fetch dashboard data");
        const dashboardData = await dashboardResponse.json();

        // Cập nhật state
        // const data = dashboardData?.data || {};
        // setIncome(data.lastPayoutAmount || 0);
        // setNewPosts(data.oldRecapsCount || 0);
        // // setViews(data.newViewCount + data.oldViewCount || 0);
        // setViews(data.oldViewCount || 0);
        // setBooks(data.books?.$values || []);
        const data = dashboardData?.data || {};
      setIncome(data.totalIncomeFromViewTracking || 0); // Thu nhập tháng này
      setNewPosts(data.newRecapsCount || 0); // Số bài viết mới tháng này
      setViews(data.newViewCount || 0);
         // Lấy dữ liệu tháng trước
      setIncomeLastMonth(data.lastPayoutAmount || 0); // Thu nhập tháng trước
      setNewPostsLastMonth(data.oldRecapsCount || 0); // Bài viết tháng trước
      setViewsLastMonth(data.oldViewCount || 0); // Lượt xem tháng trước
      setBooks(data.books?.$values || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [accessToken]);

  const handleSelectChange = (event) => {
    const value = event.target.value === "All" ? "All" : parseInt(event.target.value);
    setBooksToShow(value);
  };

  return (
    <div className="dashboard">
      <div className="performance-overview">
  <div className="overview-card">
    <h3>Thu nhập chưa quyết toán</h3>
    <div className="overview-data">
      <h3>{income ? `${income.toLocaleString("vi-VN")} đ` : '0 đ'}</h3>
     
    </div>
    <div className="overview-data">
    <p>Quyết toán gần nhất</p>
     <h4>{incomeLastMonth ? `${incomeLastMonth.toLocaleString("vi-VN")} đ` : '0 đ'}</h4>
      
    </div>
    <i className="icon-chart"></i>
  </div>

  <div className="overview-card">
    <h3>Số bài viết mới</h3>
    <div className="overview-data">
      <h3>{newPosts} bài viết</h3>
     
    </div>
    <div className="overview-data">
    <p>Tháng trước</p>
      <h4>{newPostsLastMonth} bài viết</h4>
     
    </div>
    <i className="icon-posts"></i>
  </div>

  <div className="overview-card">
    <h3>Lượt xem</h3>
    <div className="overview-data">
      <h3>{views} views</h3>
      
    </div>
    <div className="overview-data">
    <p>Tháng trước</p>
      <h4>{viewsLastMonth} views</h4>
     
    </div>
    <i className="icon-views"></i>
  </div>
</div>

      <div className="books-section">
        <div className="books-header">
          <h3>Danh sách các cuốn sách</h3>
          <select onChange={handleSelectChange} className="books-select">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="40">40</option>
            <option value="60">60</option>
            <option value="All">All Books</option>
          </select>
        </div>
        <table className="books-table-table">
          <thead>
            <tr>
              <th>Ảnh bìa</th>
              <th>Tiêu đề</th>
              <th>Năm xuất bản</th>
              <th>Số Recap</th>
              <th>Tổng thu nhập (VND)</th>
            </tr>
          </thead>
          <tbody>
            {books.slice(0, booksToShow === "All" ? books.length : booksToShow).map((book) => (
                <tr key={book.bookId} onClick={() => handleRowClick(book.bookId, book.totalEarnings)} className="book-r">

                <td><img src={book.coverImage ? book.coverImage : emptyImage} alt={book.title} className="book-cover" /></td>
                <td >{book.title}</td>
                <td>{book.publicationYear}</td>
                <td>{book.recapCount}</td>
                <td>
                {book.totalEarnings 
                  ? `${book.totalEarnings.toLocaleString("vi-VN")} đ` 
                  : '0 đ'}
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
