import React from 'react';
import { Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../Dashboard/Dashboard.css';

// Register the necessary components with Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Chart Data for Income Graphic
const incomeData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Income',
      data: [500, 700, 1250, 950, 850, 1200, 1100],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      fill: true,
    },
  ],
};

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>COMPANY</h2>
        </div>
        <ul className="sidebar-menu">
          {/* <li className="menu-item active"><Link to="/dashboard">Dashboard</Link></li> */}
          <li className="menu-item">Earnings</li>
          <li className="menu-item">
             <Link to="/report">Report</Link>
          </li>
          <li className="menu-item">Event</li>
          <li className="menu-item">Setting</li>
          <li className="menu-item">Account</li>
          <li className="menu-item">
    <Link to="/">Home Page</Link> {/* Add Link to the HomePage route */}
  </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="dashboard-header">
          <input className="search-bar" type="text" placeholder="Search" />
          <div className="user-info">
            <span className="username">Username</span>
          </div>
        </header>

        <div className="stats-container">
          <div className="stat-box followers">
            <h3>Followers</h3>
            <p>118</p>
          </div>
          <div className="stat-box favorites">
            <h3>Favorites</h3>
            <p>541</p>
          </div>
          <div className="stat-box earnings">
            <h3>Earnings</h3>
            <p>$1,820</p>
          </div>
          <div className="stat-box wallet">
            <h3>Wallet</h3>
            <p>$75</p>
          </div>
        </div>

        {/* Income Graphic and Most View Item + Growth */}
        <div className="income-most-view-container">
          <div className="chart-section">
            <h3>Income Graphic</h3>
            <Line data={incomeData} />
          </div>

          <div className="most-view-and-growth">
            <div className="most-view-item">
              <h4>Most View Item</h4>
              <ul>
                <li>#898004 Logo <span className="view-tag">View</span></li>
                <li>#898004 Print Template <span className="view-tag">View</span></li>
                <li>#898004 Background <span className="view-tag">View</span></li>
              </ul>
            </div>

            <div className="growth-chart">
              <h4>Growth</h4>
              {/* Growth chart or image goes here */}
            </div>
          </div>
        </div>

        {/* Expense and Message section */}
        <div className="expense-and-message">
          <div className="expense-section">
            <h4>Expense</h4>
            <div className="expense-chart">
              <div className="chart-circle">50%</div>
              <div className="chart-circle">25%</div>
              <div className="chart-circle">60%</div>
            </div>
          </div>

          <div className="message-section">
            <h4>Message</h4>
            <p>Invoice</p>
            <p>Promotion</p>
            <p>Event</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
