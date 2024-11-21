import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './UserRecapDetail.scss'; // Import the SCSS file
import RecapItem from './RecapItem'; // Import component RecapItem
import CreatePlaylistModal from './PlaylistModal/CreatePlaylistModal';
import ReportIssueModal from './ReportIssueModal/ReportIssueModal';

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


const UserRecapDetail = () => {
  const { id } = useParams(); // Get book ID from URL
  const [bookInfo, setBookInfo] = useState(null);
  const [recapList, setRecapList] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const accessToken = localStorage.getItem("authToken");
  const [liked, setLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal
  const [userId, setUserId] = useState(null); // State for user ID
  const [recapId, setRecapId] = useState(null); // State for recap ID
  const [recapVersionId, setRecapVersionId] = useState(null); // State for storing recapVersionId
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // State for report modal
  const [successMessage, setSuccessMessage] = useState(null); // State for success message
  const [likeCount, setLikeCount] = useState(0); // State to store the number of likes
  const [recapId2, setRecapId2] = useState(null);  // Khai báo recapId2 từ useState


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

  // const handleReportSubmit = (reportData) => {
  //   console.log("Reported Issue:", reportData);
  //   // Here, you can add the code to send the report data to your backend API.
  // };

  
  useEffect(() => {
    if (bookInfo && bookInfo.title) {
      localStorage.setItem("selectedBookTitle", bookInfo.title); // Lưu tên sách vào localStorage
    }
  }, [bookInfo]);
  

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
          // Get user ID from the API response directly
          setUserId(response.data.id); // Ensure to set the ID correctly
        } else {
          setErrorMessage('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setErrorMessage('Failed to fetch user profile'); // Update error message
      }
    };

    const fetchBookInfo = async () => {
      try {
        const response = await axios.get(`https://160.25.80.100:7124/api/book/getbookbyid/${id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.succeeded) {
          // resolveRefs(setBookInfo(response.data.data));
          // resolveRefs(fetchRecapList(response.data.data.recaps.$values));
          const resolvedData = resolveRefs(response.data.data);
        setBookInfo(resolvedData);
        
        // Fetch the list of recaps associated with the book
        const recaps = resolvedData.recaps?.$values || [];
        fetchRecapList(recaps);

        } else {
          setErrorMessage('Failed to fetch book details');
        }
      } catch (error) {
        setErrorMessage('Error fetching book details');
        console.error('Error fetching book details:', error);
      }
    };



    // Inside fetchRecapList function after fetching recaps
    const fetchRecapList = async (recaps) => {
      try {
        const detailsPromises = recaps.map(async (recap) => {
          try {
            const recapResponse = await axios.get(`https://160.25.80.100:7124/getrecapbyId/${recap.id}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
            return resolveRefs(recapResponse.data);
          } catch (error) {
            console.error(`Error fetching recap with ID: ${recap.id}`, error);
            return null;
          }
        });
    
        const fetchedRecaps = await Promise.all(detailsPromises);
        const validRecaps = fetchedRecaps.filter(recap => recap !== null);
    
        setRecapList(validRecaps);
    
        // Set the recapId and recapVersionId from the first recap if available
        if (validRecaps.length > 0) {
          const firstRecap = validRecaps[0].data;
          const recapVersions = firstRecap.recapVersions?.$values;

          setRecapId(firstRecap.id); // Set recapId from the first recap
          //setRecapVersionId(firstRecap.currentVersion.id); // Set recapVersionId from currentVersion
           // Log both recapId and recapVersionId
      console.log("Recap ID:", firstRecap.id);
      //console.log("Recap Version ID:", firstRecap.currentVersion.id);
      if (recapVersions && recapVersions.length > 0) {
        setRecapVersionId(recapVersions[0].id); // Set recapVersionId từ recapVersions
        console.log("Recap Version ID:", recapVersions[0].id); // Log recapVersionId để kiểm tra
      }


        }
        
      } catch (error) {
        console.error('Error fetching multiple recaps:', error);
      }
    };
    

    fetchUserProfile(); // Fetch user profile first
    fetchBookInfo();
  }, [id, accessToken]);

  if (errorMessage) {
    return <p className="error-notice">{errorMessage}</p>;
  }


  // const handleLikeClick = () => {
  //   setLiked(!liked);
  // };

  // Function to handle form submission to API
  const handleReportSubmit = async (reportData) => {
    try {
      const response = await axios.post('https://160.25.80.100:7124/api/supportticket/create', {
        category: reportData.category,
        description: reportData.description,
        status: 0,
        recapId: recapId,
        userId: userId
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setSuccessMessage('Issue reported successfully!'); // Set success message
        setTimeout(() => setSuccessMessage(null), 3000); // Clear message after 3 seconds
      } else {
        setErrorMessage('Failed to report the issue');
      }
    } catch (error) {
      setErrorMessage('Error reporting the issue');
      console.error('Error reporting issue:', error);
    }
  };

  // 1. Lấy số lượng like và trạng thái like từ API khi component được render lần đầu tiên
  useEffect(() => { 
    // Kiểm tra trạng thái like từ localStorage khi người dùng đã like trước đó
    const savedLikedState = localStorage.getItem(`liked_${userId}_${recapId}`);
    if (savedLikedState) {
      setLiked(JSON.parse(savedLikedState)); // Cập nhật trạng thái like từ localStorage
    }
  
    const fetchLikeCount = async () => {
      try {
        console.log("recapId:", recapId); 
        const response = await axios.get(
          `https://160.25.80.100:7124/api/likes/count/${recapId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.status === 200) {
          setLikeCount(response.data.data); // Cập nhật số lượng like từ API
        } else {
          console.error('Error fetching like count:', response.data);
        }
      } catch (error) {
        console.error('Error fetching like count:', error.response?.data || error.message);
      }
    };
  
    fetchLikeCount(); // Gọi API để lấy số lượng like khi component mount
  }, [recapId, accessToken, userId]); // Fetch lại khi recapId, accessToken hoặc userId thay đổi
  
  // 2. Hàm xử lý khi người dùng nhấn like hoặc hủy like
  const handleLikeClick = async () => {
    try {
      console.log("recapId:", recapId); 
      let response;
      if (liked) {
        // Gửi yêu cầu DELETE để hủy like
        response = await axios.delete(
          `https://160.25.80.100:7124/api/likes/remove/${recapId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
  
        if (response.status === 200) {
          const newLikedState = false;
          setLiked(newLikedState); // Cập nhật trạng thái like
          localStorage.setItem(`liked_${userId}_${recapId}`, JSON.stringify(newLikedState)); // Lưu trạng thái like vào localStorage cho người dùng cụ thể
          // Cập nhật số lượng like ngay lập tức sau khi hủy like
          setLikeCount(likeCount - 1); // Giảm số lượng like
        } else {
          console.error('Error removing like:', response.data);
        }
      } else {
        // Gửi yêu cầu POST để thêm like
        response = await axios.post(
          `https://160.25.80.100:7124/api/likes/createlike/${recapId}`,
          {
            recapId: recapId, 
            userId: userId, 
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (response.status === 200) {
          const newLikedState = true;
          setLiked(newLikedState); // Cập nhật trạng thái like
          localStorage.setItem(`liked_${userId}_${recapId}`, JSON.stringify(newLikedState)); // Lưu trạng thái like vào localStorage cho người dùng cụ thể
          // Cập nhật số lượng like ngay lập tức sau khi like
          setLikeCount(likeCount + 1); // Tăng số lượng like
        } else {
          console.error('Error liking recap:', response.data);
        }
      }
    } catch (error) {
      console.error('Error handling like action:', error.response?.data || error.message);
    }
  };
  

  return (
    <div className="book-info-container">
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
            <div className="description-container">
              <p>{bookInfo.description || 'No description available.'}</p>
            </div>
            <p className="category">
            Category: {bookInfo.categories && bookInfo.categories.$values.length > 0 
              ? bookInfo.categories.$values[0].name 
              : 'Unknown'}
          </p>

            <div className="book-detail-meta">
              <div className="meta-row">
              </div>
              <div className="meta-row">
                <div className="meta-icon meta-format">🎧 Audio & text</div>
                <div className="meta-icon meta-key-ideas">💡 Key ideas</div>
              </div>
            </div>
            {/* Book Save and Like Section */}
            <div className="book-saved">
              <span className="saved-label" onClick={handleSaveClick}>
                🔖 Save in My Playlist
              </span>
              <span
        className={`saved-like ${liked ? 'liked' : 'not-liked'}`}
        onClick={handleLikeClick}
        style={{ color: liked ? 'red' : 'black' }} // Đổi màu trái tim khi liked
      >
        {liked ? '❤️ Liked' : '🤍 Like'}
      </span>
      <h3>{likeCount} Likes</h3> {/* Hiển thị số lượng like */}



              {/* Modal for playlist creation */}
              <CreatePlaylistModal
                isOpen={isModalOpen}
                onClose={closeModal}
                recapId={recapId} // Use dynamic recap ID
                userId={userId} // Use dynamic user ID
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
          <div className="right-info">
            <h3 className="recaps-heading">Recaps</h3>
            {bookInfo.recaps && bookInfo.recaps.$values.length > 0 ? (
              <ul className="recap-items">
                {recapList.map((recapDetail) => (
                  
                  <RecapItem key={recapDetail.data.id} recapDetail={recapDetail} accessToken={accessToken} 
                  userId={userId} // Pass userId here
                   recapVersionId={recapVersionId} // Pass recapVersionId here
                   recapId={recapId}
                  />
                  
                ))}
              </ul>
            ) : (
              <p>No recaps available for this book.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserRecapDetail;
