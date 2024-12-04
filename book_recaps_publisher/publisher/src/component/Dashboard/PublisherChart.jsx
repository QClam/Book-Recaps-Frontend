// PublisherChart.jsx
import React, { useEffect, useState, useLocation } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const PublisherChart = ({ publisherId, fromDate, toDate }) => {
   // const location = useLocation();
    //const publisherId = location.state?.publisherId;
    const accessToken = localStorage.getItem('authToken');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Views',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
      {
        label: 'Watch Time',
        data: [],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
      },
      {
        label: 'Earnings',
        data: [],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: false,
      },
    ],
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(
          `https://bookrecaps.cloud/api/dashboard/getpublisherchart/${publisherId}?fromDate=${fromDate}&toDate=${toDate}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch chart data");
        const data = await response.json();
        console.log(data); 
        const dailyStats = data?.data?.dailyStats?.$values || [];
        const labels = dailyStats.map((entry) => entry.date.split('T')[0]);
        const viewsData = dailyStats.map((entry) => entry.views);
        const watchTimeData = dailyStats.map((entry) => entry.watchTime);
        const earningsData = dailyStats.map((entry) => entry.earning);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Views',
              data: viewsData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: false,
            },
            {
              label: 'Watch Time',
              data: watchTimeData,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              fill: false,
            },
            {
              label: 'Earnings',
              data: earningsData,
              borderColor: 'rgba(255, 159, 64, 1)',
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              fill: false,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, [publisherId, fromDate, toDate]);

  return (
    <div>
      <h3>Publisher Analytics</h3>
      <Line data={chartData} />
    </div>
  );
};

export default PublisherChart;
