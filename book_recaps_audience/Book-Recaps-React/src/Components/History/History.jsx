import { useEffect, useState } from 'react';
import "../History/History.scss";
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from "../../utils/axios";
import { useAuth } from "../../contexts/Auth";

const History = () => {
  const [ recapData, setRecapData ] = useState([]);
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const navigate = useNavigate(); // Initialize navigate
  const { user } = useAuth();

  useEffect(() => {
    fetchRecapData();
  }, []);

  // Function to fetch and filter recap data by user ID
  const fetchRecapData = async () => {
    try {
      const response = await axiosInstance.get(`/api/viewtracking/getviewtrackingbyuserid/${user.id}?pageNumber=1&pageSize=10`);

      // Extract recap data
      const recaps = response.data.data.data.$values;

      // Filter out duplicate recaps by recapName and keep the latest one based on createdAt
      const uniqueRecaps = Array.from(
        recaps
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt descending
          .reduce((map, recap) => map.set(recap.recapName, recap), new Map())
          .values()
      );

      setRecapData(uniqueRecaps);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recap data:', err);
      setError('Failed to fetch recap data');
      setLoading(false);
    }
  };


  // Render loading or error state
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  // Render recap data
  return (
    <div className="history-container">
      <h1>User Recap History</h1>
      <div className="history-list">
        {recapData.map((recap, index) => (
          <div key={index} className="history-card"

          >
            <div className="recap-thumbnail">
              <img
                src={recap.book.coverImage}
                alt={recap.book.title}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/user-recap-detail-item/${recap.book.bookId}`)} // Navigate to the detail page
              />
            </div>

            <div className="recap-details">
              <h2>{recap.recapName}</h2>
              <div className="recap-info">
                <span className="author"><strong>Author:</strong> {recap.book.authors.$values.join(', ')}</span>
                {/* <span className="created-at"><strong>Created At:</strong> {new Date(recap.createdAt).toLocaleString()}</span> */}
              </div>
              <div className="recap-meta">
                {/* <p><strong>Book ID:</strong> {recap.book.bookId} </p> */}
                <p><strong>Title:</strong> {recap.book.title} </p>
                <p><strong>Original Title:</strong> {recap.book.originalTitle}</p>
                <p className="likes-views">
                  <span className="likes"><strong>Likes:</strong> {recap.likesCount}</span>
                  <span className="views"><strong>Views:</strong> {recap.viewsCount}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
