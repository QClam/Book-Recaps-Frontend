import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../TopRecap/TopRecap.scss";

const TopRecap = () => {
  // State to store the recaps and loading state
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const navigate = useNavigate();
  
  // Function to fetch recaps from the API
  const fetchRecaps = async (currentPage) => {
    try {
      const response = await axios.get(`https://ai.hieuvo.dev/ml/recommendations/top-recaps?page=${currentPage}`);
      const data = response.data;

      setRecaps(data.items);
      setLastPage(data.lastPage);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch recaps');
      setLoading(false);
    }
  };

  // Use useEffect to load data on component mount
  useEffect(() => {
    fetchRecaps(page);
  }, [page]);

  // Handle pagination
  const handleNextPage = () => {
    if (page < lastPage) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="for-user">
  <h2>Top Recaps</h2>
  <div className="recommendations">
    {recaps.map((recap) => (
      <div key={recap.id} className="recommendation-item">
        <img 
              src={recap.book.coverImage} 
              alt={recap.book.title} 
              style={{ width: '250px', height: '300px', objectFit: 'cover' }}
              onClick={() => navigate(`/recap-item-detail/${recap.id}`)}
 // Thêm sự kiện onClick
            />
        <div className="recommendations-recap">
          <h4>{recap.book.title}</h4>
          <p><strong>Published:</strong> {recap.book.publicationYear}</p>
          <p><strong>Recap Name:</strong> {recap.name}</p>
          {recap.isPremium && <span style={{ color: 'orange', fontWeight: 'bold' }}>Premium</span>}
        </div>
      </div>
    ))}
  </div>
  <div className="paginationtt-go">
  <button onClick={handlePreviousPage} disabled={page <= 1} className="pagination-btn">
    <span>&laquo; Previous</span>
  </button>
  <span className="pagination-info">Page {page} of {lastPage}</span>
  <button onClick={handleNextPage} disabled={page >= lastPage} className="pagination-btn">
    <span>Next &raquo;</span>
  </button>
</div>

</div>

  );
};

export default TopRecap;
