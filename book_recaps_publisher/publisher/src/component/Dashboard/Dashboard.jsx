import React, { useState, useEffect } from 'react'; 
import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';
import emptyImage from "../../assets/empty-image.png";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);


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
  const [chartData, setChartData] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleRowClick = (bookId, totalEarnings) => {
    navigate(`/book-dashboard/${bookId}`, { state: { totalEarnings } }); 
  };
  useEffect(() => {
    // Tự động lấy ngày đầu tiên và cuối cùng của tháng hiện tại
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    )
      .toISOString()
      .split("T")[0];

    setFromDate(firstDayOfMonth);
    setToDate(lastDayOfMonth);
  }, []);

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

         // Fetch chart data
      const chartResponse = await fetch(
        `https://bookrecaps.cloud/api/dashboard/getpublisherchart/${publisherId}?fromDate=${fromDate}&toDate=${toDate}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!chartResponse.ok) throw new Error("Failed to fetch chart data");
      const chartData = await chartResponse.json();
      const dailyStats = chartData.data.dailyStats.$values || [];

      setChartData({
        labels: dailyStats.map((item) => item.date.split('T')[0]),
        datasets: [
          {
            label: 'Lượt xem',
            data: dailyStats.map((item) => item.views),
            borderColor: 'rgba(75,192,192,1)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            tension: 0.4,
          },
          {
            label: 'Thời lượng xem (giây )',
            data: dailyStats.map((item) => item.watchTime),
            borderColor: 'rgba(153,102,255,1)',
            backgroundColor: 'rgba(153,102,255,0.2)',
            tension: 0.4,
          },
          {
            label: 'Doanh thu (VNĐ)',
            data: dailyStats.map((item) => item.earning),
            borderColor: 'rgba(255,159,64,1)',
            backgroundColor: 'rgba(255,159,64,0.2)',
            tension: 0.4,
          },
        ],
      });



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

        const data = dashboardData?.data || {};
      setIncome(data.totalIncomeFromViewTracking || 0); 
      setNewPosts(data.newRecapsCount || 0); 
      setViews(data.newViewCount || 0);
         // Lấy dữ liệu tháng trước
      setIncomeLastMonth(data.lastPayoutAmount || 0); 
      setNewPostsLastMonth(data.oldRecapsCount || 0); 
      setViewsLastMonth(data.oldViewCount || 0); 
      setBooks(data.books?.$values || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchData();
  }, [fromDate, toDate, accessToken]);

  const handleSelectChange = (event) => {
    const value = event.target.value === "All" ? "All" : parseInt(event.target.value);
    setBooksToShow(value);
  };

  
  return (
    <div className="dashboarddr">
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
              {/* <th>Tổng thu nhập (VND)</th> */}
              <th>Tổng tiền đã thanh toán (VND)</th>
              <th>Tổng tiền chưa thanh toán (VND)</th>
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
                {book.paidEarnings 
                  ? `${book.paidEarnings.toLocaleString("vi-VN")} đ` 
                  : '0 đ'}
              </td>
              <td>
                {book.unPaidEarnings 
                  ? `${book.unPaidEarnings.toLocaleString("vi-VN")} đ` 
                  : '0 đ'}
              </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="chartdb">
      <div className="date-filter">
        <label htmlFor="fromDate">Từ ngày:</label>
        <input
          type="date"
          id="fromDate"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <label htmlFor="toDate">Đến ngày:</label>
        <input
          type="date"
          id="toDate"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      <div className="chart-section">
        <h3>Thống kê biểu đồ</h3>
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false },
              },
              scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Giá trị' } },
              },
            }}
          />
        ) : (
          <p>Chọn ngày để xem dữ liệu.</p>
        )}
      </div>
      </div>

    </div>
  );
};

export default Dashboard;
