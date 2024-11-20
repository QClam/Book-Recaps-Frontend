import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import CreatePlaylistModal from '../PlaylistModal/CreatePlaylistModal';
import ReportIssueModal from '../ReportIssueModal/ReportIssueModal';
import RecapItem from '../RecapItem';
//import RecapItemNew from '../RecapItemNew/RecapItemNew';

const UserRecapNewDetail = () => {
  const { id } = useParams(); 
  const location = useLocation();
  const { recapId, bookId } = location.state || {}; // Access recapId and bookId passed via navigation state
  const [recapList, setRecapList] = useState([]);
  const [recapDetails, setRecapDetails] = useState(null); // Initialize recap details
  const [bookInfo, setBookInfo] = useState(null); // Initialize book details
  const [errorMessage, setErrorMessage] = useState(null);
  const [liked, setLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // State for report modal
  const [successMessage, setSuccessMessage] = useState(null); // State for success message
  const accessToken = localStorage.getItem("authToken");
  const [recapVersionId, setRecapVersionId] = useState(null); // State for storing recapVersionId
  const [userId, setUserId] = useState(null); 
  const [audioUrl, setAudioUrl] = useState(null);
const [transcriptUrl, setTranscriptUrl] = useState(null);

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openReportModal = () => {
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  // Fetch recap details
  useEffect(() => {
    const fetchUserProfile = async () => {
        const accessToken = localStorage.getItem("authToken");
        if (!accessToken) {
          setErrorMessage('No authorization token available');
          return;
        }
  
        try {
          const response = await axios.get('https://160.25.80.100:7124/api/personal/profile', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.data) {
            console.log('User Profile:', response.data); // Log the response to inspect the data structure
            setUserId(response.data.id); // Ensure that `id` exists in the response data
          } else {
            setErrorMessage('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setErrorMessage('Failed to fetch user profile');
        }
      };
  
      const fetchRecapDetails = async () => {
        console.log('Fetching recap details for recapId:', recapId); // Log recapId
        try {
          const response = await axios.get(`https://160.25.80.100:7124/getrecapbyId/${recapId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          setRecapDetails(response.data);
      
          // Extract recapVersions from the response if available
          if (response.data && response.data.data && response.data.data.recapVersions) {
            console.log('Recap Versions:', response.data.data.recapVersions);
            
            // Now you have access to recapVersions
            const recapVersions = response.data.data.recapVersions;
            const recapValues = recapVersions.$values;
      
            // Log all available recap version IDs
            console.log('Available Recap Version IDs:', recapValues.map(version => version.id));
      
            // If you want to use any specific recap version ID dynamically, here is how you can do it
            const recapVersion = recapValues.find(version => version.id === recapValues[0].id); // Example: using the first recap version id
      
            if (recapVersion) {
                console.log('Found Recap Version:', recapVersion);

                // You can now access audioURL and transcriptUrl directly from the recapVersion object
                const { audioURL, transcriptUrl } = recapVersion;
                console.log('Audio URL:', audioURL);
                console.log('Transcript URL:', transcriptUrl);

                // Optionally, store these URLs in state for rendering later
                setAudioUrl(audioURL);
                setTranscriptUrl(transcriptUrl);
            } else {
                console.log('Recap Version not found');
            }
        }

        } catch (error) {
          setErrorMessage('Error fetching recap details');
          console.error('Error fetching recap details:', error);
        }
      };
      
    const fetchBookInfo = async () => {
      try {
        const response = await axios.get(`https://160.25.80.100:7124/api/book/getbookbyid/${bookId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.succeeded) {
          setBookInfo(response.data.data);
          setRecapList(response.data.data.recaps.$values); // Assuming recaps are part of the book response
        } else {
          setErrorMessage('Failed to fetch book details');
        }
      } catch (error) {
        setErrorMessage('Error fetching book details');
        console.error('Error fetching book details:', error);
      }
    };

    if (recapId && bookId) {
        fetchUserProfile();
        fetchRecapDetails();
        fetchBookInfo();
      }
    }, [recapId, bookId, accessToken]);

  if (errorMessage) {
    return <p className="error-notice">{errorMessage}</p>;
  }

  const handleLikeClick = () => {
    setLiked(!liked);
  };

  // Function to handle form submission to API for reporting issues
  const handleReportSubmit = async (reportData) => {
    try {
      const response = await axios.post('https://160.25.80.100:7124/api/supportticket/create', {
        category: reportData.category,
        description: reportData.description,
        status: 0,
        recapId: recapId,
        userId: userId,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccessMessage('Issue reported successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage('Failed to report the issue');
      }
    } catch (error) {
      setErrorMessage('Error reporting issue');
      console.error('Error reporting issue:', error);
    }
  };

  return (
    <div className="recap-detail-container">
      {successMessage && <p className="success-notice">{successMessage}</p>}

      {bookInfo ? (
        <div className="info-layout">
          <div className="left-info">
            <h2 className="title">{bookInfo.title}</h2>
            <img src={bookInfo.coverImage} alt={bookInfo.title} className="cover-image" />
            <h2 className="author-name">
              {bookInfo.authors && bookInfo.authors.$values.length > 0
                ? bookInfo.authors.$values[0].name
                : 'Unknown Author'}
            </h2>
            <p className="original-title">Original Title: {bookInfo.originalTitle || 'No original title available'}</p>
            <p className="category">
              Category: {bookInfo.categories && bookInfo.categories.$values.length > 0 
                ? bookInfo.categories.$values[0].name 
                : 'Unknown'}
            </p>
            <div className="description-container">
              <p>{bookInfo.description || 'No description available.'}</p>
            </div>

            {/* Like and Save Section */}
            <div className="book-saved">
              <span className="saved-label" onClick={handleSaveClick}>
                🔖 Save in My Playlist
              </span>
              <span className="saved-like" onClick={handleLikeClick}>
                {liked ? '❤️ Liked' : '🤍 Like'}
              </span>

              {/* Modal for playlist creation */}
              <CreatePlaylistModal
                isOpen={isModalOpen}
                onClose={closeModal}
                recapId={recapId} // Pass recapId dynamically
                
              />

              {/* Add the "Report an Issue" icon here */}
              <div className="report-issue">
                <span onClick={openReportModal} style={{ cursor: "pointer", color: "blue" }}>
                  🏳️ Report an issue
                </span>
              </div>
              <ReportIssueModal isOpen={isReportModalOpen} onClose={closeReportModal} onSubmit={handleReportSubmit} />
            </div>
          </div>
          
         {/* Display the audio URL and transcript URL */}
         
        
         <div className="right-info">
        <h3 className="recaps-heading">Recaps</h3>
        {/* {bookInfo.recaps && bookInfo.recaps.$values.length > 0 ? (
          <ul className="recap-items">
            {recapList.map((recapDetail, index) => (
            <RecapItem
                key={recapDetail?.data?.id || index} // Fallback to index if id is unavailable
                recapDetail={recapDetail}
                accessToken={accessToken}
                userId={userId}
                recapVersionId={recapVersionId}
            />
            ))}
          </ul>
        ) : (
          <p>No recaps available for this book.</p>
        )} */}

          </div>

        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserRecapNewDetail;
