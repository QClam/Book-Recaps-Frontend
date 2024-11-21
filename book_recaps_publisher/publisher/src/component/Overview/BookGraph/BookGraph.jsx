import React, { useEffect, useState } from 'react';  
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios'; // Import axios
import '../Overview.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BookGraph = () => {
  const [bookData, setBookData] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [bookTitleCounts, setBookTitleCounts] = useState({});
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // Hàm để lấy dữ liệu từ API
  const fetchData = async () => {
    try {
      const response = await axios.get('https://160.25.80.100:7124/api/book/getallbooks', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data = response.data;
      const books = data.data.$values;
      setBookData(books);
      calculateCategoryCounts(books);
      calculateBookTitleCounts(books); // New function to calculate book title counts
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await handleTokenRefresh();
        fetchData();
      } else {
        console.error("Error fetching data: ", error);
      }
    }
  };

  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  // Hàm để tính số lượng sách theo thể loại
  const calculateCategoryCounts = (books) => {
    const counts = {};
    books.forEach(book => {
      book.categories.$values.forEach(category => {
        counts[category.name] = (counts[category.name] || 0) + 1;
      });
    });
    setCategoryCounts(counts);
  };

  // Hàm để tính số lượng sách theo tên sách
  const calculateBookTitleCounts = (books) => {
    const counts = {};
    books.forEach(book => {
      counts[book.title] = (counts[book.title] || 0) + 1; // Assuming titles are unique
    });
    setBookTitleCounts(counts);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Dữ liệu cho biểu đồ thể loại sách
  const categoryChartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: 'Số lượng sách theo thể loại',
        data: Object.values(categoryCounts),
        backgroundColor: '#4CAF50',
      },
    ],
  };

  // Dữ liệu cho biểu đồ số lượng sách theo tên
  const titleChartData = {
    labels: Object.keys(bookTitleCounts),
    datasets: [
      {
        label: 'Số lượng sách theo tên',
        data: Object.values(bookTitleCounts),
        backgroundColor: '#FF5733',
      },
    ],
  };

  return (
    <div className="overview-container">
      <h1 className="overview-title">Publisher Dashboard</h1>

      {/* Biểu đồ số lượng sách theo thể loại */}
      <div className="chart-container">
        <h2>Số lượng sách theo thể loại</h2>
        <Bar data={categoryChartData} options={{ maintainAspectRatio: false }} />
      </div>

      {/* Biểu đồ số lượng sách theo tên */}
      <div className="chart-container">
        <h2>Số lượng sách theo tên</h2>
        <Bar data={titleChartData} options={{ maintainAspectRatio: false }} />
      </div>

      {/* Nút để xem nội dung hợp đồng */}
      <div className="view-contract">
        <h2>Xem Hợp Đồng</h2>
        <Link to="/contract" className="view-contract-button">Xem Hợp Đồng</Link>
      </div>
    </div>
  );
};

export default BookGraph;
