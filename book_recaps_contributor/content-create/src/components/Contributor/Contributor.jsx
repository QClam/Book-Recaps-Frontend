import React, { useState } from 'react';
import '../Contributor/Contributor.scss';
import BookAuthor from "../../images/book.jpg";
import { Link } from 'react-router-dom';
import HomeDashboard from '../HomeDashboard/HomeDashboard';
import Content from '../ContentSumary/ContentSumary';
import ContentSumary from '../ContentSumary/ContentSumary';
import SendApplication from '../SendApplication/SendApplication';
import Report from '../Dashboard/Report';
const Contributor = () => {
  const [selectedPage, setSelectedPage] = useState('dashboardda'); // Track which menu item is selected


  return (
    <div className="contributor-dashboard">
      <aside className="sidebar">
        <div className="profile">
          <img src={BookAuthor} alt="Profile" />
          <h2>Nannie Nelson</h2>
          <p>Montreal, QC</p>
          <div className="stats">
            <span>278 Videos</span>
            <span>36.5K Subscribers</span>
          </div>
        </div>
        <nav>
          <ul>
          <li onClick={() => setSelectedPage('dashboardda')}>Dashboard</li>
          <li onClick={() => setSelectedPage('contentsum')}>Content</li>
          <li onClick={() => setSelectedPage('sendapplication')}>Support</li>
          <li onClick={() => setSelectedPage('viewapplication')}>View Application</li>
           
          </ul>
          <div className="subscriptions">
            <span>Subscriptions</span>
            <span className="badge">29 new</span>
          </div>
          <ul>
            {/* <li>Comments</li>
            <li>Subtitles</li> */}
             <li>Analytics</li>
            <li>Earn</li>
          </ul>
        </nav>
        <footer>
          <div className="settings">Settings</div>
          
        </footer>
      </aside>

      <main className="content">
        {/* <section className="stats-section">
          <div className="card basic-settings">
            <h3>Basic Settings</h3>
            <p>Channel Description</p>
            <button>Edit</button>
          </div>
          <div className="card analytics">
            <h3>Analytics</h3>
            <p>Watch Time: 16.9K mins</p>
            <p>Avg. View Duration: 08:23</p>
            <p>Views: 95.6K</p>
          </div>
          <div className="card tips">
            <h3>Tips</h3>
            <ul>
              <li>Luis Mann subscribed</li>
              <li>Derrick Fletcher left a comment</li>
              <li>Earl Black liked your video</li>
            </ul>
          </div>
        </section> */}

        {/* <section className="video-manager">
          <h3>Video Manager</h3>
          <div className="video-grid">
           
            <div className="video-card">
              <img src="video-thumbnail-url" alt="Video" />
              <h4>The Best Gaming Phones of 2018</h4>
              <p>Views: 7.3K</p>
              <p>2 days ago</p>
            </div>
            
          </div>
        </section> */}

        {/* <section className="side-info">
          <div className="playlists">
            <h3>Playlists</h3>
            <ul>
              <li>What I'm Holding</li>
              <li>Feng Shui Inspired</li>
            </ul>
          </div>
          <div className="live">
            <h3>Live</h3>
            <p>Live events: Do it live!</p>
          </div>
        </section> */}
        {/* Render the selected page */}
        {selectedPage === 'dashboardda' && <HomeDashboard />}
        {selectedPage === 'contentsum' && <ContentSumary />}
        {selectedPage === 'sendapplication' && <SendApplication />}
        {selectedPage === 'viewapplication' && <Report />}
      </main>
    </div>
  );
};

export default Contributor;
