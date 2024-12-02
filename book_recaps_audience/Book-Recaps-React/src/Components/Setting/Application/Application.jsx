import { useEffect, useState } from 'react';
import "../Application/Application.scss";
import { useNavigate } from 'react-router-dom';
import { routes } from "../../../routes";
import { axiosInstance } from "../../../utils/axios";
import { useAuth } from "../../../contexts/Auth";

const Application = () => {
  const [ supportTickets, setSupportTickets ] = useState([]);
  const [ errorMessage, setErrorMessage ] = useState(null);
  const { user } = useAuth();

  const navigate = useNavigate();

  // Fetch support tickets by userId and get book title
  useEffect(() => {
    const fetchSupportTickets = async () => {
      try {
        const response = await axiosInstance.get(`/api/supportticket/getsupportticketbyuser/${user.id}`);
        if (response.data.succeeded) {
          const tickets = response.data.data.$values;
          setSupportTickets(tickets);

          // Get book titles for each ticket
          for (const ticket of tickets) {
            const recapId = ticket.recapId;
            if (recapId) {
              try {
                const bookResponse = await axiosInstance.get(`/getrecapbyId/${recapId}`);
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
          setSupportTickets([ ...tickets ]);
        } else {
          setErrorMessage('Failed to fetch support tickets');
        }
      } catch (error) {
        setErrorMessage('Error fetching support tickets');
        console.error('Error:', error);
      }
    }
    fetchSupportTickets();
  }, []);

  const goToExplore = () => {
    navigate(routes.explore);
  };

  return (
    <div className="container mx-auto max-w-screen-xl p-5">
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

            <td>{ticket.response}</td>
            <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default Application;
