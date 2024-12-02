import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import "../Publisher/BookPayout.scss";
import dayjs from "dayjs";
import Chart from "chart.js/auto";
import { Box, Typography, Paper, Card, CardContent } from "@mui/material";
import { DateRangePicker } from "rsuite";
import axios from "axios";


const BookPayout = () => {
  const { bookId } = useParams(); // Lấy bookId từ URL
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookData, setBookData] = useState({
    title: "",
    dailyStats: [],
    lastPayout: { fromDate: "", toDate: "", amount: 0 },
    totalEarnings: 0, 
  });

  const accessToken = localStorage.getItem("authToken");
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const today = dayjs().format("YYYY-MM-DD");
  const [dateRange, setDateRange] = useState([today, today]);
 
  const location = useLocation();
  const { totalEarnings } = location.state || {}; 
  const earningAmount = location.state?.earningAmount;

  // Fetch thông tin sách
  const fetchBookDetail = async () => {
    try {
      const response = await axios.get(
        `https://bookrecaps.cloud/api/book/getbookbyid/${bookId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setBook(response.data?.data || null);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch book detail:", error);
      setLoading(false);
    }
  };

  // Fetch dữ liệu thống kê sách
  const getBookData = async (fromDate, toDate) => {
    if (!bookId) return;

    try {
      const response = await axios.get(
        `https://bookrecaps.cloud/api/dashboard/getbookdetail/${bookId}`,
        {
          params: { fromDate, toDate },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const bookDetails = response.data;
      const bookData = bookDetails.data || {};
      const dailyStats = bookData.dailyStats?.$values || [];

      setBookData({
        title: bookData.title || "Không có tiêu đề",
        dailyStats,
        lastPayout: bookData.lastPayout || { fromDate: "", toDate: "", amount: 0 },
        totalEarnings: bookData.totalEarnings || 0,
      });

      console.log("Fetched dailyStats:", dailyStats);
      updateChart(dailyStats); // Cập nhật biểu đồ với dữ liệu mới
    } catch (error) {
      console.error("Error Fetching Book Detail: ", error);
    }
  };

  // Hàm khởi tạo hoặc cập nhật biểu đồ
  const updateChart = (dailyStats) => {
    if (!chartRef.current) return;

    // Nếu biểu đồ đã tồn tại, hủy trước khi tạo mới
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    const labels = dailyStats.map((stat) => dayjs(stat.date).format("DD-MM-YYYY"));
    const earnings = dailyStats.map((stat) => stat.earning);

    console.log("Updating chart with labels:", labels);
    console.log("Updating chart with earnings:", earnings);

    // Tạo biểu đồ mới
    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Earnings",
            data: earnings,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Doanh thu theo thời gian" },
        },
        scales: {
          x: { title: { display: true, text: "Ngày" } },
          y: {
            title: { display: true, text: "Thu nhập (VND)" },
            beginAtZero: true,
          },
        },
      },
    });
  };

  // Lấy dữ liệu khi thay đổi khoảng thời gian
  const handleDateChange = async (range) => {
    if (range?.[0] && range?.[1]) {
      const fromDate = dayjs(range[0]).format("YYYY-MM-DD");
      const toDate = dayjs(range[1]).format("YYYY-MM-DD");

      setDateRange([fromDate, toDate]);
      await getBookData(fromDate, toDate);
    } else {
      console.error("Invalid date range");
    }
  };

  // Fetch dữ liệu sách và biểu đồ khi lần đầu load
  useEffect(() => {
    fetchBookDetail();
  
    // Lấy ngày bắt đầu mặc định (30 ngày trước) và ngày hiện tại
    const fromDate = dayjs().subtract(30, "days").format("YYYY-MM-DD");
    const toDate = dayjs().format("YYYY-MM-DD");
    
    setDateRange([fromDate, toDate]);
    getBookData(fromDate, toDate);
  }, [bookId, accessToken]);
  

  if (loading) return <div>Loading...</div>;

  return (
    
    <div className="book-detail">
      <h1>{book.title}</h1>
     
      <img src={book.coverImage} alt={book.title} className="book-img" />
      <div className="book-info">
      <p><strong>Tên gốc:</strong> {book.originalTitle}</p>
      <p><strong>Năm xuất bản:</strong> {book.publicationYear}</p>      
      <p><strong>Mô tả:</strong> {book.description}</p>
      <p><strong>Năm xuất bản:</strong> {book.publicationYear}</p>
      <p><strong>Nhà xuất bản:</strong> {book.publisher.publisherName}</p>
      <p><strong>Tác giả:</strong> {book.authors.$values.map((author) => author.name).join(', ')}</p>
      <p><strong>Thể loại:</strong> {book.categories.$values.map((category) => category.name).join(', ')}</p>     
      <p><strong>Liên hệ Nhà xuất bản:</strong> {book.publisher?.contactInfo}</p>
      <p><strong>ISBN-13:</strong> {book.isbN_13 || "Not available"}</p>
      <p><strong>ISBN-10:</strong> {book.isbN_10 || "Not available"}</p>
      <p><strong>Giới hạn tuổi:</strong> {book.ageLimit}</p>
      <div>    
      <p className="thunhap">
    <strong>Tổng thu nhập: </strong> 
    {earningAmount ? (
        <>
        {`${new Intl.NumberFormat('vi-VN').format(earningAmount)}`} 
        <span className="currency-dong">₫</span>
        </>
    ) : (
        'Không có dữ liệu'
    )}
    </p>


    </div>
     
      </div>
      <div className="chart-container">
      <Box sx={{ padding: 4, width: "70vw",marginTop: "15cm"  }}>
        <Typography variant="h4" gutterBottom>
          Doanh thu của cuốn sách: {bookData.title}
        </Typography>
       
      <Box>
  <Typography textAlign="center" sx={{ marginBottom: 2 }}>
    Tổng thu nhập từ {dayjs(dateRange[0]).format("DD-MM-YYYY")} đến {dayjs(dateRange[1]).format("DD-MM-YYYY")}
  </Typography>
  <Box display="flex" justifyContent="center">
    <DateRangePicker 
      format="dd-MM-yyyy" 
      onChange={handleDateChange} 
      value={[dayjs(dateRange[0]).toDate(), dayjs(dateRange[1]).toDate()]} // Hiển thị khoảng mặc định
    />
  </Box>
</Box>

        <Card>
          <CardContent>
            <canvas ref={chartRef}></canvas>
          </CardContent>
        </Card>
      </Box>
      </div>
    </div>
  );
};

export default BookPayout;
