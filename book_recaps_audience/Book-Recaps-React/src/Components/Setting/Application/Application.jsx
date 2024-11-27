import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../Application/Application.scss";
import { useNavigate } from 'react-router-dom';

const Application = () => {
  const [supportTickets, setSupportTickets] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [bookTitle, setBookTitle] = useState("");
  const [userId, setUserId] = useState(null);

  const accessToken = localStorage.getItem("authToken");
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

  // Fetch support tickets by userId and get book title
// Fetch support tickets by userId and get book title and recap name
useEffect(() => {
  if (userId) {
    const fetchSupportTickets = async () => {
      try {
        const response = await axios.get(
          `https://160.25.80.100:7124/api/supportticket/getsupportticketbyuser/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.succeeded) {
          const tickets = response.data.data.$values;
          setSupportTickets(tickets);

          // Get book titles and recap names for each ticket
          for (const ticket of tickets) {
            const recapId = ticket.recapId;
            if (recapId) {
              try {
                const bookResponse = await axios.get(
                  `https://160.25.80.100:7124/getrecapbyId/${recapId}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                  }
                );
                if (bookResponse.data.succeeded && bookResponse.data.data) {
                  const recapData = bookResponse.data.data;
                  ticket.bookTitle = recapData.book?.title || "Unknown Book Title";
                  ticket.recapName = recapData.name || "Unknown Recap Name";
                } else {
                  ticket.bookTitle = "Unknown Book Title";
                  ticket.recapName = "Unknown Recap Name";
                }
              } catch (error) {
                console.error('Error fetching recap data:', error);
                ticket.bookTitle = "Error fetching title";
                ticket.recapName = "Error fetching recap name";
              }
            }
          }
          setSupportTickets([...tickets]);
        } else {
          setErrorMessage('Failed to fetch support tickets');
        }
      } catch (error) {
        setErrorMessage('Error fetching support tickets');
        console.error('Error:', error);
      }
    };

    fetchSupportTickets();
  }
}, [userId, accessToken]);


  const goToExplore = () => {
    navigate('/explore');
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
            <th>Type</th>
            <th>Book Title</th>
            <th>Recap Name</th>

           
            <th>Descriptions</th>
            <th>Status</th>
            
            <th>Response</th>
            <th>Create Date</th>
          </tr>
        </thead>
        <tbody>
          {supportTickets.map(ticket => (
            <tr key={ticket.id}>
              <td><a href="#">{ticket.category}</a></td>
              <td>{ticket.bookTitle || "Unknown Book Title"}</td>
              <td>{ticket.recapName || "Unknown Recap Name"}</td>


              <td>{ticket.description}</td>
              <td className={`status ${ticket.status === 1 ? 'open' : 'closed'}`}>
                {ticket.status === 1 ? 'Đang xử lí' : 'Đã xử lí'}

              </td>
              
              <td>{ticket.response }</td>
              <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Application;
