import React from 'react';
import '../Dashboard/Report.scss';
import { Link } from 'react-router-dom';
const Report = () => {
  return (
    <div className="report-container">
      {/* Sidebar */}
      {/* <div className="sidebar">
        <div className="sidebar-header">
          <h2>COMPANY</h2>
        </div>
        <ul className="sidebar-menu">
        <li className="menu-item active"><Link to="/dashboard">Dashboard</Link></li>
        <li className="menu-item">Earnings</li>
        <li className="menu-item">
             <Link to="/report">Report</Link>
          </li>
          
          <li className="menu-item">Event</li>
          <li className="menu-item">Setting</li>
          <li className="menu-item">Account</li>
          <li className="menu-item">
    <Link to="/">Home Page</Link> 
  </li>
        </ul>
      </div> */}

      {/* Main Content */}
      <div className="main-content">
        <header className="report-header">
          <div className="tab-menu">
            <button className="tab active">Send</button>
            <button className="tab">Feedback</button>
            <button className="tab">Waiting</button>
          </div>
        </header>

        {/* Report Table */}
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>Type notification</th>
                <th>Time</th>
                <th>Status</th>
                <th>Descriptions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="/">Accident</a></td>
                <td>27/07/2017, 14:32</td>
                <td><span className="status done">Done</span></td>
                <td>Dolore quia quas nobis quod rerum...</td>
              </tr>
              <tr>
                <td><a href="/">Violence</a></td>
                <td>27/07/2017, 17:32</td>
                <td><span className="status timeout">Time out</span></td>
                <td>Ullam cupiditate ipsum consectetur...</td>
              </tr>
              <tr>
                <td><a href="/">Robbery</a></td>
                <td>27/07/2017, 21:45</td>
                <td><span className="status inprogress">Inprogress</span></td>
                <td>Cum excepturi omnis at odio officiis...</td>
              </tr>
              <tr>
                <td><a href="/">Ambulance</a></td>
                <td>24/07/2017, 09:32</td>
                <td><span className="status timeout">Time out</span></td>
                <td>Tempora molestiae iste sunt perferendis...</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span>First page</span>
          <button>1</button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <button>5</button>
          <span>Last page</span>
        </div>
      </div>
    </div>
  );
};

export default Report;
