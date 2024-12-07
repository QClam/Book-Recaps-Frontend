import { Link } from 'react-router-dom'; // Import Link để điều hướng
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
// import './Overview.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Overview = () => {
  // Mock data cho các biểu đồ
  const salesData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [1200, 1900, 3000, 5000, 2300, 3500],
        backgroundColor: '#4CAF50',
      },
    ],
  };

  const revenueData = {
    labels: ['E-books', 'Physical Books', 'Subscriptions'],
    datasets: [
      {
        label: 'Revenue Sources',
        data: [6000, 4000, 2000],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const engagementData = {
    labels: ['New Users', 'Returning Users'],
    datasets: [
      {
        data: [3000, 2000],
        backgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <div className="overview-container">
      <h1 className="overview-title">Publisher Dashboard</h1>

      {/* Sales Performance */}
      <div className="chart-container">
        <h2>Sales Performance</h2>
        <Bar data={salesData} options={{ maintainAspectRatio: false }} />
      </div>

      {/* Revenue Breakdown */}
      <div className="chart-container">
        <h2>Revenue Breakdown</h2>
        <Pie data={revenueData} />
      </div>

      {/* Engagement Metrics */}
      <div className="chart-container">
        <h2>Engagement Metrics</h2>
        <Pie data={engagementData} />
      </div>

      {/* Nút để xem nội dung hợp đồng */}
      <div className="view-contract">
        <h2>Xem Hợp Đồng</h2>
        <Link to="/contract" className="view-contract-button">Xem Hợp Đồng</Link>
      </div>

      {/* Future Features Placeholder */}
      <div className="future-features">
        <h2>Future Analytics and Trends</h2>
        <p>Additional charts and metrics will be added to track future trends and predictions.</p>
      </div>
    </div>
  );
};

export default Overview;
