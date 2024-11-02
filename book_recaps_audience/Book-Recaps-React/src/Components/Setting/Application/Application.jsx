import React, { useEffect, useState } from 'react';
import axios from 'axios';
//import './UserSupportTickets.css'; // Import the CSS file
import "../Application/Application.scss";
import { useNavigate } from 'react-router-dom';

const Application = () => {
  const [supportTickets, setSupportTickets] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const accessToken = localStorage.getItem("authToken");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  // Fetch user profile to get userId
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('https://160.25.80.100:7124/api/personal/profile', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data) {
          setUserId(response.data.id);
        } else {
          setErrorMessage('Failed to fetch user profile');
        }
      } catch (error) {
        setErrorMessage('Error fetching user profile');
        console.error('Error:', error);
      }
    };

    fetchUserProfile();
  }, [accessToken]);

  // Fetch support tickets by userId
  useEffect(() => {
    if (userId) {
      const fetchSupportTickets = async () => {
        try {
          const response = await axios.get(`https://160.25.80.100:7124/api/supportticket/getsupportticketbyuser/${userId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.data.succeeded) {
            setSupportTickets(response.data.data.$values);
          } else {
            setErrorMessage('Failed to fetch support tickets');
          }
        } catch (error) {
          setErrorMessage('');
          console.error('Error:', error);
        }
      };

      fetchSupportTickets();
    }
  }, [userId, accessToken]);

  const goToExplore = () => {
    navigate('/explore'); // Điều hướng sang trang "Explore"
  };
  return (
    <div className="support-tickets-container">
      {errorMessage && <p className="error-notice">{errorMessage}</p>}

      <div className="tabs">
      <button className="tab active" onClick={goToExplore}>Home</button>
        
      </div>

      <table className="support-tickets-table">
        <thead>
          <tr>
            <th>Type notification</th>
            <th>Time</th>
            <th>Status</th>
            <th>Descriptions</th>
          </tr>
        </thead>
        <tbody>
          {supportTickets.map(ticket => (
            <tr key={ticket.id}>
              <td><a href="#">{ticket.category}</a></td>
              <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>


              <td className={`status ${ticket.status === 0 ? 'open' : 'closed'}`}>
                {ticket.status === 0 ? 'Inprogress' : 'Done'}
              </td>
              <td>{ticket.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Application;
