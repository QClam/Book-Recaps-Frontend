import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import FeedbackContent from '../Content/FeedbackContent';
import Swal from 'sweetalert2';
import { Hourglass } from 'react-loader-spinner';

function Review() {
  const [contentItem, setContentItem] = useState(null);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`https://66eb9ee32b6cf2b89c5b1714.mockapi.io/ContentItems/${id}`);
        setContentItem(response.data);
        console.log("Fetched Content: ", response.data);
      } catch (error) {
        console.log("Error Fetching", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
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
    return <div className='loading'>
    <Hourglass
        visible={true}
        height="80"
        width="80"
        ariaLabel="hourglass-loading"
        wrapperStyle={{}}
        wrapperClass=""
        colors={['#306cce', '#72a1ed']}
    />
</div>;
  }

  if (!contentItem) {
    return <div>No content found for id {id}</div>;
  }

  return (
    <div>
      <h1>{contentItem.title}</h1>
      <p>{contentItem.description}</p>
      <p>Status: {contentItem.status}</p>
      <Link to={`/note/content_version/${contentItem.id}`}>Comment</Link>

      <FeedbackContent version_number={contentItem.version_number} />
      <br />
      {contentItem.status === 'Pending' && (
        <button onClick={confirmApprove}>Phê duyệt nội dung</button>
      )}
    </div>
  );
}

export default Review;
