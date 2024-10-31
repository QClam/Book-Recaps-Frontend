import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Hourglass } from 'react-loader-spinner';
import './ReviewNote.scss';

function Review() {
  const [contentItem, setContentItem] = useState(null);
  const { id } = useParams(); // Get the ID from the URL
  const [loading, setLoading] = useState(true);
  const [recapStatus, setRecapStatus] = useState(null);
  const [recapDetail, setRecapDetail] = useState(null);
  const [bookRecap, setBookRecap] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [summaryNote, setSummaryNote] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentComment, setCurrentComment] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [recapVersionId, setRecapVersionId] = useState(null);

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
      setContentItem(recap);
      setSummaryNote(recap.comments);
      setRecapVersionId(recap.recapVersionId);
      return recap.recapVersionId; // Return recapVersionId for the next request
    } catch (error) {
      console.log('Error Fetching Content', error);
      Swal.fire('Error', 'Failed to fetch content.', 'error');
    }
  };

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
      setRecapStatus(recapVersionData);
      return {
        recapId: recapVersionData.recapId,
        transcriptUrl: recapVersionData.transcriptUrl,
      };
    } catch (error) {
      console.log('Error Fetching Recap Version', error);
      Swal.fire('Error', 'Failed to fetch recap version.', 'error');
    }
  };

  const fetchRecapDetail = async (recapId) => {
    try {
      const response = await axios.get(
        `https://160.25.80.100:7124/getrecapbyId/${recapId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const recapDetailData = response.data.data;
      setRecapDetail(recapDetailData);
      return recapDetailData.bookId;
    } catch (error) {
      console.log('Error Fetching Recap Detail', error);
      Swal.fire('Error', 'Failed to fetch recap detail.', 'error');
    }
  };

  const fetchBookRecap = async (bookId) => {
    try {
      const response = await axios.get(
        `https://160.25.80.100:7124/api/book/getbookbyid/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookRecap(response.data.data);
    } catch (error) {
      console.log('Error Fetching Book', error);
      Swal.fire('Error', 'Failed to fetch book details.', 'error');
    }
  };

  const fetchTranscript = async (transcriptUrl) => {
    try {
      const response = await axios.get(transcriptUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTranscript(response.data);
      console.log("Transcript: ", response.data);

    } catch (error) {
      console.log('Error Fetching Transcript', error);
      Swal.fire('Error', 'Failed to fetch transcript.', 'error');
    }
  };

  const fetchComment = async (reviewId) => {
    try {
      const response = await axios.get(`https://160.25.80.100:7124/api/reviewnote/getallnotebyreviewid/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      )
      const comments = response.data.data.$values
      setComments(comments)
      console.log("Comments: ", comments);
    } catch (error) {
      console.log('Error Fetching', error);
    }
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const recapVersionId = await fetchContent();
      if (recapVersionId) {
        const { recapId, transcriptUrl } = await fetchRecapVersion(recapVersionId);
        if (recapId) {
          const bookId = await fetchRecapDetail(recapId);
          if (bookId) {
            await fetchBookRecap(bookId);
          }
        }
        if (transcriptUrl) {
          await fetchTranscript(transcriptUrl);
        }
      }
    } catch (error) {
      console.log('Error Fetching Data', error);
      Swal.fire('Error', 'Failed to fetch data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchComment(id)
  }, [id]);

  const handleApprove = async () => {
    if (!recapVersionId) {
      console.error("recapVersionId is not defined");
      return;
    }

    const reqBody = {
      recapVersionId: recapVersionId,
      status: 2
    };
    try {
      const response = await axios.put(`https://160.25.80.100:7124/change-recapversion-status`, reqBody ,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRecapStatus(response.data);
    } catch (error) {
      console.log('Error updating status', error);
      Swal.fire('Error', 'Failed to update status.', 'error');
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
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        handleApprove();
        Swal.fire('Đã chấp thuận!', 'Nội dung này đã được phê duyệt.', 'success');
      }
    });
  };

  const handleTakenote = async (existingComment) => {
    if (!selectedIndex) {
      console.error("selectedIndex is not defined");
      return;
    }

    const { sectionIndex, sentenceIndex } = selectedIndex;
    const selectedSection = transcript.transcriptSections[sectionIndex];
    let targetText = "";

    if (selectedSection) {
      const transcriptSentences = selectedSection.transcriptSentences; // Lưu trữ mảng sentences vào biến

      // Kiểm tra xem sentenceIndex có nằm trong khoảng hợp lệ không
      if (sentenceIndex >= 0 && sentenceIndex < transcriptSentences.length) {
        const selectedSentence = transcriptSentences[sentenceIndex]; // Truy cập selectedSentence
        if (selectedSentence) {
          targetText = selectedSentence.value.html; // Truy cập targetText
          console.log("targetText: ", targetText);
        } else {
          console.log("selectedSentence is undefined");
        }
      } else {
        // Lấy giá trị cuối cùng nếu không có giá trị nào
        const selectedSentence = transcriptSentences[transcriptSentences.length - 1]; // Lấy giá trị cuối
        if (selectedSentence) {
          targetText = selectedSentence.value.html; // Truy cập targetText
          console.log("targetText from last sentence: ", targetText);
        }
      }
    } else {
      console.error("selectedSection is undefined!");
    }

    // Kiểm tra nếu targetText vẫn rỗng
    if (!targetText) {
      console.error("targetText is still undefined after processing.");
      return;
    }
    const startIndex = '0';

    const newComment = {
      reviewId: id,
      targetText: targetText,
      startIndex: startIndex, 
      endIndex: (targetText.length - 1).toString(),
      sentenceIndex: sentenceIndex.toString(), // Use sentenceIndex
      feedback: currentComment,
    };

    try {
      // Check existing comment
      if (existingComment) {
        await axios.put(`https://160.25.80.100:7124/api/reviewnote/updatereviewnote/${existingComment.id}`, newComment, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`https://160.25.80.100:7124/api/reviewnote/createreviewnote`, newComment, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      fetchComment(id); // Refresh comments
      setCurrentComment('');
      setShowInput(false); 
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };


  const handleRightClick = (e, sectionIndex, sentenceIndex) => {
    e.preventDefault();
    setSelectedIndex({ sectionIndex, sentenceIndex });

    const existingComment = comments.find(
      (comment) => comment.sentenceIndex === String(sentenceIndex) && !comment.isDeleted
    );

    // Log để kiểm tra
    console.log("Current Sentence Index: ", sentenceIndex);
    console.log("Comments: ", comments);
    console.log("Existing Comment: ", existingComment);

    if (existingComment) {
      setCurrentComment(existingComment.feedback); // Show existing feedback
      setShowInput(true);
    } else {
      setCurrentComment('');
      setShowInput(true);
    }
  };

  const handleDeleteComment = async (existingComment) => {
    Swal.fire({
      title: 'Bạn đã chắc chắn chưa?',
      text: 'Bạn không thể hoàn tác hành động này',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, xóa!',
      cancelButtonText: 'Hủy',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`https://160.25.80.100:7124/api/reviewnote/delete/${existingComment.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              },
            },
          );
          fetchComment(id);
          setShowInput(false)
        } catch (error) {
          console.log("Error Delete Comment", error);
          Swal.fire('Lỗi', 'Không thể xóa comment.', 'error');
        }
        Swal.fire('Đã xóa!', 'Comment này đã được xóa.', 'success');
      }
    })
  }

  const handleAchieveButton = async () => {
    if (!recapVersionId) {
      console.error("recapVersionId is not defined");
      return;
    }
    
    const reqBody = {
      id: id,
      recapVersionId: recapVersionId,
      comments: "Đạt"
    };
    
    try {
      const response = await axios.put(`https://160.25.80.100:7124/api/review/updatereview/${id}`, reqBody, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      const recap = response.data.data;
      setSummaryNote(recap.comments);
    } catch (error) {
      console.log("Error Achieve", error);
    }
  };

  const handleNotAchieveButton = async () => {
    if (!recapVersionId) {
      console.error("recapVersionId is not defined");
      return;
    }

    const reqBody = {
      id: id,
      recapVersionId: recapVersionId,
      comments: "Chưa Đạt"
    };

    try {
      const response = await axios.put(`https://160.25.80.100:7124/api/review/updatereview/${id}`, reqBody, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      const recap = response.data.data;
      setSummaryNote(recap.comments);
    } catch (error) {
      console.log("Error Not Achieve", error);
    }
  };

  if (loading) {
    return (
      <div className='loading'>
        <Hourglass
          visible={true}
          height='80'
          width='80'
          ariaLabel='hourglass-loading'
          wrapperClass=''
          colors={['#306cce', '#72a1ed']}
        />
      </div>
    );
  }

  if (!contentItem) {
    return <div>No content found for id {id}</div>;
  }

  return (
    <div className='audio-grid'>
      <div className='transcript-container'>
        <div className='transcript-box'>
          <div className='transcript'>
            <h1>{bookRecap.title}</h1>
            <p>{bookRecap.description}</p>
            <br />
            <div>
              {transcript.transcriptSections.map((section, sectionIndex) => {
                return (
                  <div key={sectionIndex} className='transcript-section'>
                    <h2>Section {sectionIndex + 1}</h2>
                    {section.transcriptSentences.map((sentence, sentenceIndexInSection) => {
                      // Tính toán chỉ số toàn cục cho sentence
                      const globalSentenceIndex = section.transcriptSentences.reduce(
                        (acc, curr, idx) => acc + (idx < sentenceIndexInSection ? 1 : 0),
                        0
                      ) + sectionIndex * section.transcriptSentences.length;

                      const existingComment = comments.find(
                        (comment) =>
                          comment.sentenceIndex === globalSentenceIndex.toString() &&
                          !comment.isDeleted
                      );

                      return (
                        <span
                          key={globalSentenceIndex}
                          id={`word-${globalSentenceIndex}`}
                          style={{ cursor: 'pointer', position: 'relative' }}
                          onContextMenu={(e) => handleRightClick(e, sectionIndex, globalSentenceIndex)}
                        >
                          {sentence.value.html + ' '}
                          {existingComment && (
                            <span>📋</span>
                          )}
                          {showInput &&
                            selectedIndex &&
                            selectedIndex.sectionIndex === sectionIndex &&
                            selectedIndex.sentenceIndex === globalSentenceIndex && (
                              <div className='add-comment-container'>
                                <textarea
                                  value={currentComment}
                                  onChange={(e) => setCurrentComment(e.target.value)}
                                  placeholder="Add a comment..."
                                />
                                <button onClick={() => handleTakenote(existingComment)}
                                  style={{ backgroundColor: "green" }}>
                                  Take Note
                                </button>
                                <button onClick={() => setShowInput(false)}
                                  style={{ backgroundColor: "red" }}>
                                  Cancel</button>
                                <button style={{ backgroundColor: "#FF0000" }} 
                                onClick={() => handleDeleteComment(existingComment)}
                                disabled={!existingComment}>
                                  Xoá</button>
                              </div>
                            )}
                        </span>
                      );
                    })}
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </div>

      <div className="staff-comments-side">
        <div className="staff-comments">
          <h3>Staff Comments</h3>
          <div className="comment">
            {comments.map((comment) => (
              <ul key={comment.id}>
                <li>Staff Name</li>
                <li>{new Date(comment.createdAt).toLocaleDateString()}</li>
                <li>Đoạn: {comment.targetText}</li>
                <li>Feedback: {comment.feedback}</li>
                <br />
              </ul>
            ))}
          </div>
          <div className="summary-note">
            <h4>Ghi chú tổng:</h4>
            <textarea placeholder="Ghi chú ở đây..." className="comment-input" readOnly value={summaryNote}></textarea>
            <div className="status-buttons">
              <button style={{ backgroundColor: "red" }}
                onClick={handleNotAchieveButton}>
                Chưa đạt</button>
              <button style={{ backgroundColor: "green" }}
                onClick={handleAchieveButton}>
                  Đạt</button>
            </div>
            <button style={{ backgroundColor: "#007bff" }}
              onClick={confirmApprove} disabled={summaryNote === "Chưa Đạt"}>Phê Duyệt Nội Dung</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Review;
