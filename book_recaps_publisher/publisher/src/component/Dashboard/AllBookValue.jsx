// AllBookValue.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AllBookValue = ({ bookEarnings }) => {
  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: bookEarnings.map((book) => `${new Date(book.fromDate).toLocaleDateString()} - ${new Date(book.toDate).toLocaleDateString()}`),
    datasets: [
      {
        label: 'Doanh Thu Sách (₫)',
        data: bookEarnings.map((book) => book.earningAmount),
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        tension: 0.4,
        // Thêm tên sách vào mỗi điểm dữ liệu trong biểu đồ
        pointBackgroundColor: bookEarnings.map((book) => '#42A5F5'),
        pointHoverBackgroundColor: bookEarnings.map((book) => '#0D47A1'),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Biểu Đồ Doanh Thu Sách',
      },
      tooltip: {
        callbacks: {
          // Tùy chỉnh tooltip để hiển thị tên sách cùng với doanh thu
          title: (tooltipItems) => {
            const bookIndex = tooltipItems[0].dataIndex;
            return `${bookEarnings[bookIndex].title}`;
          },
          label: (tooltipItem) => {
            return `₫ ${tooltipItem.raw.toLocaleString()}`;
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default AllBookValue;
