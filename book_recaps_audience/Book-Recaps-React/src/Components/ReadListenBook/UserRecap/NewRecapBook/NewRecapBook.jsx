import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

const NewRecapBook = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchRecaps = async () => {
      try {
        const response = await axios.get('https://160.25.80.100:7124/api/recap/Getallrecap', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const recapData = resolveRefs(response.data.data.$values);

        const groupedBooks = {};
        recapData.forEach(recap => {
          if (recap.book && recap.book.id) {
            const bookId = recap.book.id;
            if (!groupedBooks[bookId]) {
              groupedBooks[bookId] = { ...recap.book, recaps: [] };
            }
            groupedBooks[bookId].recaps.push(recap);
          }
        });

        setBooks(Object.values(groupedBooks));
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchRecaps();
        } else {
          console.error("Error fetching recaps:", error);
          setError("Failed to fetch recaps. Please try again later.");
        }
      }
    };

    fetchRecaps();
  }, [accessToken]);

  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", { refreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Session expired. Please log in again.");
    }
  };

  const handleRecapClick = (recapId) => {
    console.log("Navigating to recap with ID:", recapId); // Add this log to check recapId
    if (recapId) {
      navigate(`/user-recap/${recapId}`);
    } else {
      console.error('Recap ID is undefined');
    }
  };
  
  


  return (
    <div>
      <h2>Book Recaps</h2>
      {books.map(book => (
        <div key={book.id || Math.random()} style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '8px' }}>
          <h3>{book.title} ({book.publicationYear})</h3>
          <img src={book.coverImage} alt={book.title} style={{ width: '150px' }} />
          <p>{book.description}</p>
          <h4>Recaps:</h4>
          <ul>
            {book.recaps.map(recap => (
              <li 
                key={recap.id || Math.random()} 
                onClick={() => handleRecapClick(recap.id)} // Corrected to use recap.id
                style={{ cursor: 'pointer' }}
              >
                <p><strong>{recap.name}</strong></p>
                <p>Likes: {recap.likesCount || 0} | Views: {recap.viewsCount || 0}</p>
                {recap.currentVersion && recap.currentVersion.audioURL && (
                  <audio controls src={recap.currentVersion.audioURL} />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default NewRecapBook;
