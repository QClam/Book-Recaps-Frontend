import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const UserRecapDetailv2 = () => {
  const { recapId } = useParams();
  const [recapDetails, setRecapDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecapDetails = async () => {
      try {
        const response = await axios.get(`https://bookrecaps.cloud/getrecapbyId/${recapId}`);
        setRecapDetails(response.data); // Assuming this returns the recap details
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recap details:", error);
        setError("Failed to fetch recap details");
        setLoading(false);
      }
    };

    fetchRecapDetails();
  }, [recapId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!recapDetails) {
    return <p>No recap details found.</p>;
  }
  return (
    <div>
      <h2>{recapDetails?.name}</h2>
      <p>{recapDetails?.description}</p>
      <p>Likes: {recapDetails?.likesCount}</p>
      <p>Views: {recapDetails?.viewsCount}</p>
      {recapDetails?.audioURL && (
        <audio controls src={recapDetails?.audioURL}></audio>
      )}
    </div>
  );
  
};

export default UserRecapDetailv2;
