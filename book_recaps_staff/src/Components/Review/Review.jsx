import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Hourglass } from 'react-loader-spinner';

function Review() {
  const [contentItem, setContentItem] = useState(null);
  const { id } = useParams(); // Get the ID from the URL
  const [loading, setLoading] = useState(true);
  const [recapStatus, setRecapStatus] = useState(null);
  const [recapDetail, setRecapDetail] = useState(null);
  const [bookRecap, setBookRecap] = useState(null);
  
  const token = localStorage.getItem('access_token');

  const fetchContent = async () => {
    try {
      const response = await axios.get(
        `https://160.25.80.100:7124/api/review/getreviewbyid/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const recap = response.data.data;
      console.log('Fetched Content: ', recap);
      setContentItem(recap);
      return recap.recapVersionId; // Return recapVersionId for the next request
    } catch (error) {
      console.log('Error Fetching Content', error);
    }
  };

// Fetch RecapVersion để lấy recapId và status của Version hiện tại
  const fetchRecapVersion = async (recapVersionId) => {
    try {
      const response = await axios.get(
        `https://160.25.80.100:7124/version/${recapVersionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const recapVersionData = response.data.data;
      console.log('RecapId: ', recapVersionData.recapId);
      setRecapStatus(recapVersionData);
      return recapVersionData.recapId;    
    } catch (error) {
      console.log('Error Fetching Recap Version', error);
    }
  };

  //Fetch Recap để lấy bookId 
  const fetchRecapDetail = async (recapId) => {
    try {
      const response = await axios.get(`https://160.25.80.100:7124/getrecapbyId/${recapId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const recapDetailData = response.data.data;
      console.log("BookId: ", recapDetailData.bookId);
      setRecapDetail(recapDetailData);
      return recapDetailData.bookId;
    } catch (error) {
      console.log('Error Fetching Recap Detail', error);
    }
  }

  //Fetch bookId để lấy detail sách
  const fetchBookRecap = async (bookId) => {
    try {
      const response = await axios.get(`https://160.25.80.100:7124/api/book/getbookbyid/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        },
      )
      const bookRecap = response.data.data;
      console.log("Book Detail: ", bookRecap);
      setBookRecap(bookRecap);
    } catch (error) {
      console.log('Error Fetching Book', error);
    }
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch content first to get recapVersionId
      const recapVersionId = await fetchContent();
      if (recapVersionId) {
        // Fetch recap version and detail using recapVersionId
        const recapId = await fetchRecapVersion(recapVersionId);
        if (recapId) {
          const bookid = await fetchRecapDetail(recapId);
          // Fetch recap detail để lấy bookId
          if(bookid) {
            await fetchBookRecap(bookid);
          }
        }
      }
    } catch (error) {
      console.log('Error Fetching Data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleApprove = async () => {
    try {
      await axios.put(`https://66eb9ee32b6cf2b89c5b1714.mockapi.io/ContentItems/${id}`, {
        ...contentItem,
        status: 'Approved'
      });
      setContentItem(prev => ({ ...prev, status: 'Approved' })); // Update local state
    } catch (error) {
      console.log("Error updating status", error);
    }
  };

  const confirmApprove = () => {
    Swal.fire({
      title: 'Bạn đã chắc chắn chưa?',
      text: 'Bạn thực sự muốn phê duyệt Nội dung này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, phê duyệt!',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        handleApprove();
        Swal.fire(
          'Đã chấp thuận!',
          'Nội dung này đã được phê duyệt.',
          'success'
        );
      }
    });
  };

  if (loading) {
    return (
      <div className='loading'>
        <Hourglass
          visible={true}
          height="80"
          width="80"
          ariaLabel="hourglass-loading"
          wrapperStyle={{}}
          wrapperClass=""
          colors={['#306cce', '#72a1ed']}
        />
      </div>
    );
  }

  if (!contentItem) {
    return <div>No content found for id {id}</div>;
  }

  return (
    <div>
      <h1>{bookRecap.title}</h1>
      <p>{bookRecap.description}</p>
      {recapStatus?.status === 1 ? (
        <button className="role-container" style={{ backgroundColor: "#007bff" }}>
          Pending
        </button>
      ) : (
        <button className="role-container" style={{ backgroundColor: "#5e6061" }}>
          Unknown
        </button>
      )}
      <div>
        <Link to={`/note/content_version/${contentItem.id}`}>Comment</Link>
      </div>
      <p>{contentItem.comments}</p>
      <br />
      {recapStatus?.status === 1 && (
        <button onClick={confirmApprove}>Phê duyệt nội dung</button>
      )}
    </div>
  );
}

export default Review;
