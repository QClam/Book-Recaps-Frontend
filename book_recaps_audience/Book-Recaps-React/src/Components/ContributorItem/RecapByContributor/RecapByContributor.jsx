import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './RecapByContributor.scss';
import { useNavigate } from 'react-router-dom';

const resolveRefs = (data) => {
  const refMap = new Map();
  const createRefMap = (obj) => {
    if (typeof obj !== "object" || obj === null) return;
    if (obj.$id) {
      refMap.set(obj.$id, obj);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        createRefMap(obj[key]);
      }
    }
  };
  const resolveRef = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    if (obj.$ref) {
      return refMap.get(obj.$ref);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = resolveRef(obj[key]);
      }
    }
    return obj;
  };
  createRefMap(data);
  return resolveRef(data);
};


const RecapByContributor = () => {
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const navigate = useNavigate();

  // Fetch Recaps
  const fetchRecaps = async () => {
    try {
      const recapResponse = await axios.get(
        'https://bookrecaps.cloud/api/recap/Getallrecap',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const recapData = resolveRefs(recapResponse.data);
  
      console.log('Recap data:', recapData); // Check full structure for $ref
  
      if (recapData.succeeded) {
        const recapsWithContributor = await Promise.all(
          recapData.data.$values.map(async (recap) => {
            if (recap.userId) {
              const contributor = await fetchContributorInfo(recap.userId);
              return { ...recap, contributor };
            } else if (recap.$ref) {
              console.error('Found $ref, resolving not implemented:', recap.$ref);
              // Add logic here to resolve the reference
              return { ...recap, contributor: null };
            } else {
              console.error('Missing userId and no $ref for recap:', recap);
              return { ...recap, contributor: null };
            }
          })
        );
        setRecaps(recapsWithContributor);
      } else {
        console.error('Failed to fetch recaps:', recapData.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await handleTokenRefresh();
        await fetchRecaps();
      } else {
        setError('Error fetching recaps.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch contributor info
  const fetchContributorInfo = async (userId) => {
    try {
      const contributorResponse = await axios.get(
        `https://bookrecaps.cloud/api/users/get-user-account-byID?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const contributorData = contributorResponse.data;

      if (contributorData.succeeded && contributorData.data) {
        return {
          fullName: contributorData.data.fullName || 'Unknown', // Handle null value
          imageUrl: contributorData.data.imageUrl || 'default-avatar.jpg', // Fallback image
        };
      }
       else {
        console.error('Failed to fetch contributor info:', contributorData.message);
        return null;
      }
    } catch (error) {
      setError('Error fetching contributor info.');
      return null;
    }
  };

  // Handle token refresh
  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://bookrecaps.cloud/api/tokens/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Session expired. Please log in again.");
    }
  };

  useEffect(() => {
    fetchRecaps();
  }, [accessToken]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

const handleBookClick = (book) => {
  navigate(`/user-recap-detail/${book.id}`); // Điều hướng đến trang chi tiết cuốn sách
};

  return (
    <div className="recap-list">
      {recaps.length === 0 ? (
        <p>No recaps available.</p>
      ) : (
        recaps.map((recap) => (
          <div key={recap.id} className="recap-item">
              <div className="recap-book" onClick={() => handleBookClick(recap.book)}>
              {/* Kiểm tra nếu recap.book có dữ liệu */}
          {recap.book && (
            <>
              <img src={recap.book.coverImage} alt={recap.book.title} className="recap-book-image" />
              <h2>{recap.book.title}</h2>
              <p>{recap.book.description}</p>
            </>
          )}

            </div>
            <div className="recap-contributor">
              {recap.contributor ? (
                <>
                  <img src={recap.contributor.imageUrl} alt={recap.contributor.fullName} className="contributor-image" />
                  <h3>{recap.contributor.fullName}</h3>
                </>
              ) : (
                <p>Contributor information not available.</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RecapByContributor;
