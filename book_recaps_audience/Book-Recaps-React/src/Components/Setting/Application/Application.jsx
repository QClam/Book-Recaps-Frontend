import { useEffect, useState } from 'react';
import "../Application/Application.scss";
import { axiosInstance } from "../../../utils/axios";
import { useAuth } from "../../../contexts/Auth";
import { cn } from "../../../utils/cn";

const Application = () => {
  const [ supportTickets, setSupportTickets ] = useState([]);
  const [ errorMessage, setErrorMessage ] = useState(null);
  const { user } = useAuth();

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

  return (
    <div className="container mx-auto max-w-screen-xl p-5">
      <h1 className="font-semibold text-2xl mb-6">Lịch sử đơn báo cáo</h1>
      {errorMessage && <p className="error-notice">{errorMessage}</p>}

      <table className="support-tickets-table bg-white">
        <thead>
        <tr>
          <th>Loại đơn</th>
          <th><p className="w-max">Tên bài viết</p></th>
          <th>Nội dung</th>
          <th>Trạng thái</th>
          <th>Xử lý</th>
          <th>Ngày tạo</th>
          <th><p className="w-max">Ngày xử lý</p></th>
        </tr>
        </thead>
        <tbody>
        {supportTickets.map(ticket => (
          <tr key={ticket.id}>
            <td><a href="#">{ticket.category}</a></td>
            <td>{ticket.recapName || "Unknown Recap Name"}</td>
            <td>{ticket.description}</td>
            <td>
              <p className={cn("status text-sm w-max", {
                "open": ticket.status === 1,
                "closed": ticket.status === 2
              })}>
                {ticket.status === 1 ? 'Đang xử lí' : ticket.status === 2 ? 'Đã xử lí' : 'Chưa gửi'}
              </p>
            </td>
            <td>{ticket.response}</td>
            <td><p className="break-words">{new Date(ticket.createdAt).toLocaleString()}</p></td>
            <td><p className="break-words">{ticket.updatedAt !== "0001-01-01T00:00:00" && new Date(ticket.updatedAt).toLocaleString()}</p></td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default Application;
