import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ContributorRecaps = () => {
  const { userId } = useParams();
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accessToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchContributorRecaps = async () => {
      try {
        const response = await axios.get(`https://160.25.80.100:7124/api/recap/GetRecapsByContributor?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.succeeded) {
          // Kiểm tra xem dữ liệu có tồn tại và đúng định dạng không
          const fetchedRecaps = response.data.data.$values || [];
          setRecaps(fetchedRecaps);
        } else {
          setError('Failed to fetch contributor recaps: ' + response.data.message);
        }
      } catch (error) {
        // Xử lý lỗi cụ thể nếu có
        console.error('Error fetching contributor recaps:', error);
        setError('Error fetching contributor recaps. Please check your network or API status.');
      } finally {
        setLoading(false);
      }
    };

    fetchContributorRecaps();
  }, [userId, accessToken]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Recaps by Contributor</h1>
      {recaps.length === 0 ? (
        <p>No recaps available for this contributor.</p>
      ) : (
        recaps.map(recap => (
          <div key={recap.id} className="recap-item">
            <h2>{recap.book.title}</h2>
            <p>{recap.description}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ContributorRecaps;
