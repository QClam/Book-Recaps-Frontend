import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { json, Link, useParams } from 'react-router-dom';
import { Hourglass } from 'react-loader-spinner';

import { handleFetchError } from '../../utils/handleError';
import { fetchProfile } from '../Auth/Profile';
import api from '../Auth/AxiosInterceptors';
import './ReviewNote.scss';
import axios from 'axios';

function Review() {
  const [contentItem, setContentItem] = useState(null);
  const { id } = useParams(); // Bắt Id từ URL
  const [loading, setLoading] = useState(true);
  const [recapVersion, setRecapVersion] = useState(null);
  const [recapDetail, setRecapDetail] = useState(null);
  const [bookRecap, setBookRecap] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [summaryNote, setSummaryNote] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentComment, setCurrentComment] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [recapVersionId, setRecapVersionId] = useState(null);
  const [profile, setProfile] = useState([]);
  const [plagiarismResults, setPlagiarismResults] = useState([]);
  const [hasResults, setHasResults] = useState(false);
  const [metadata, setMetadata] = useState([]);
  const [plagiarismProcessing, setPlagiarismProcessing] = useState(false);



  const [mode, setMode] = useState('comment');

  const handleChangeMode = (newMode) => {
    setMode(newMode);
  }

  const token = localStorage.getItem('access_token');

  const fetchContent = async () => {
    try {
      const response = await api.get(
        `/api/review/getreviewbyid/${id}`,
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
      return recap.recapVersionId; // Trả recapVersionId cho các req tiếp 
    } catch (error) {
      console.log('Error Fetching Content', error);
      Swal.fire('Error', 'Failed to fetch content.', 'error');
    }
  };

  const fetchRecapVersion = async (recapVersionId, controller = new AbortController()) => {
    try {
      const response = await api.get(
        `/version/${recapVersionId}`,
        {
          signal: controller.signal
        }
      );
      const recapVersionData = response.data.data;
      setRecapVersion(recapVersionData);
      console.log(recapVersionData);

      return {
        recapId: recapVersionData.recapId,      
        transcriptUrl: recapVersionData.transcriptUrl,
        plagiarismCheckStatus: recapVersionData.plagiarismCheckStatus,
      };
    } catch (error) {
      console.log('Error Fetching Recap Version', error);
      Swal.fire('Error', 'Failed to fetch recap version.', 'error');
    }
  };

  const fetchRecapDetail = async (recapId) => {
    try {
      const response = await api.get(
        `/getrecapbyId/${recapId}`,
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
      const response = await api.get(
        `/api/book/getbookbyid/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBookRecap(response.data.data);
      // console.log(response.data.data);

    } catch (error) {
      console.log('Error Fetching Book', error);
      Swal.fire('Error', 'Failed to fetch book details.', 'error');
    }
  };

  const fetchTranscript = async (transcriptUrl) => {
    try {
      const response = await api.get(transcriptUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTranscript(response.data);

    } catch (error) {
      console.log('Error Fetching Transcript', error);
      Swal.fire('Error', 'Failed to fetch transcript.', 'error');
    }
  };

  const fetchComment = async (reviewId) => {
    try {
      const response = await api.get(`/api/reviewnote/getallnotebyreviewid/${reviewId}`,
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
    fetchProfile(token, (profileData) => {
      setProfile(profileData)
    });
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
      const response = await api.put(`/change-recapversion-status`, reqBody,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRecapVersion(response.data);

      const id = recapVersionId;
      const postPlagirism = await axios.post("https://ai.hieuvo.dev/plagiarism/add-recap-versions", [id])
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

  const handleReject = async () => {
    if (!recapVersionId) {
      console.error("recapVersionId is not defined");
      return;
    }

    const reqBody = {
      recapVersionId: recapVersionId,
      status: 3
    };
    try {
      const response = await api.put(`/change-recapversion-status`, reqBody,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setRecapVersion(response.data);
    } catch (error) {
      console.log('Error updating status', error);
      Swal.fire('Error', 'Failed to update status.', 'error');
    }
  }

  const confirmReject = () => {
    Swal.fire({
      title: 'Bạn đã chắc chắn chưa?',
      text: 'Bạn thực sự muốn từ chối Nội dung này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, từ chối!',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        handleReject();
        Swal.fire('Đã từ chối!', 'Nội dung này đã bị từ chối.', 'success');
      }
    });
  };

  const handleRightClick = (e, sectionIndex, sentenceIndex, targetHtml) => {
    e.preventDefault();
    setSelectedIndex({ sectionIndex, sentenceIndex });

    const existingComment = comments.find(
      (comment) => comment.sentenceIndex === String(sentenceIndex) && !comment.isDeleted
    );

    // Log để kiểm tra
    // console.log("Current Sentence Index: ", sentenceIndex);
    // console.log("Comments: ", comments);
    // console.log("Existing Comment: ", existingComment);
    console.log("Target HTML: ", targetHtml); // đoạn HTML đã được target

    if (existingComment) {
      setCurrentComment(existingComment.feedback); // Hiển thị comment hiện tại
      setShowInput(true);
    } else {
      setCurrentComment('');
      setShowInput(true);
    }
  };

  const handleTakenote = async (targetText, existingComment) => {
    if (!selectedIndex) {
      console.error("selectedIndex is not defined");
      return;
    }

    const { sectionIndex, sentenceIndex } = selectedIndex;
    const selectedSection = transcript.transcriptSections[sectionIndex];

    if (!selectedSection) {
      console.error("selectedSection is undefined!");
      return;
    }

    // targetText từ handleRightClick
    // console.log("targetText: ", targetText);

    const newComment = {
      reviewId: id,
      targetText: targetText,
      startIndex: '0',
      endIndex: (targetText.length - 1).toString(),
      sentenceIndex: sentenceIndex.toString(),
      feedback: currentComment,
    };

    try {
      if (existingComment) {
        await api.put(`/api/reviewnote/updatereviewnote/${existingComment.id}`, newComment, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await api.post(`/api/reviewnote/createreviewnote`, newComment, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      fetchComment(id);
      setCurrentComment('');
      setShowInput(false);
    } catch (error) {
      console.error('Error saving comment:', error);
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
          const response = await api.delete(`/api/reviewnote/delete/${existingComment.id}`,
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
      const response = await api.put(`/api/review/updatereview/${id}`, reqBody, {
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
      const response = await api.put(`/api/review/updatereview/${id}`, reqBody, {
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

  const checkPlagiarism = async () => {

    if (!recapVersionId) {
      console.error("recapVersionId is not available");
      return;
    }
    try {
      const response = await axios.get(
        `https://ai.hieuvo.dev/plagiarism/check-plagiarism/${recapVersionId}`
      );
      console.log("Initial check response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error checking plagiarism:", error);
      return null;
    }
  };

  const getPlagiarismResults = async (controller) => {

    if (!recapVersionId) {
      console.error("recapVersionId is not available");
      return;
    }
    try {
      const response = await axios.get(
        `https://ai.hieuvo.dev/plagiarism/get-results/${recapVersionId}`,
        {
          signal: controller.signal,
        }
      );
      const resultData = response.data;
      console.log("Két quả:", response.data);
      const { plagiarism_results, existing_recap_versions_metadata } = resultData;
      if (plagiarism_results.length > 0 || existing_recap_versions_metadata > 0) {
        setPlagiarismResults(plagiarism_results);
        setMetadata(existing_recap_versions_metadata);
        setHasResults(true);
      } else {
        setPlagiarismResults([]);
        setMetadata([]);
        setHasResults(true);
      }
      return resultData;
    } catch (error) {
      console.error("Error fetching plagiarism results:", error);
      return null;
    }
  };

  const handleCheckPlagiarism = async () => {
    if (!recapVersionId) {
      console.error("recapVersionId is not available");
      return;
    }
    setPlagiarismProcessing(true);
  
    const controller = new AbortController();
    try {
      
      console.log("Starting initial plagiarism check...");
      const initialResponse = await checkPlagiarism(); 
      if (!initialResponse) {
        console.error("Failed to initiate plagiarism check.");
        setPlagiarismProcessing(false);
        return;
      }
       
      let pollingComplete = false;
      while (!pollingComplete) {
        console.log("Polling for plagiarism check status...");
        const result = await fetchRecapVersion(recapVersionId, controller);
  
        if (result?.plagiarismCheckStatus === 2) {
          console.log("Plagiarism check completed.");
          setRecapVersion(result);
          pollingComplete = true;
        } else {
          console.log("Plagiarism check not completed yet, status:", result?.plagiarismCheckStatus);
          await new Promise((resolve) => setTimeout(resolve, 1500)); 
        }
      }

      console.log("Fetching plagiarism results...");
      await getPlagiarismResults(controller);
    } catch (error) {
      console.error("Error during plagiarism checking process:", error);
    } finally {
      setPlagiarismProcessing(false);
      controller.abort(); // Abort any ongoing fetch
      console.log("Polling process aborted.");
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
      <div className='transcript-section-container'>
        <h1>{bookRecap.title}</h1>
        <div className='button-group'>
          <button onClick={() => handleChangeMode('comment')}
            style={{ backgroundColor: "#90c494", color: "#f0f0f0", opacity: mode === "comment" ? 1 : 0.6 }}
          >
            Nhận xét
          </button>
          <button onClick={() => handleChangeMode('plagiarism')}
            style={{ backgroundColor: "#c49c9c", color: "#f0f0f0", opacity: mode === "plagiarism" ? 1 : 0.6 }}
          >
            Kiểm tra đạo văn
          </button>
        </div>
        <div>
        </div>
        <div className='transcript-container'>
          {mode === 'comment' ? (
            <div className='transcript-box'>
              <div className='transcript'>
                <div>
                  {transcript.transcriptSections.map((section, sectionIndex) => {
                    return (
                      <div key={sectionIndex} className='transcript-section'>
                        <h2>Key Idea {sectionIndex + 1}</h2>
                        {section.transcriptSentences.map((sentence) => {
                          const globalSentenceIndex = sentence.sentence_index;

                          const existingComment = comments.find(
                            (comment) =>
                              comment.sentenceIndex === globalSentenceIndex.toString() &&
                              !comment.isDeleted
                          );

                          return (
                            <span
                              key={globalSentenceIndex}
                              id={`word-${globalSentenceIndex}`}
                              className='take-note'
                              style={{ cursor: 'pointer', position: 'relative' }}
                              onContextMenu={(e) => handleRightClick(e, sectionIndex, globalSentenceIndex, sentence.value.html)}
                            >
                              {sentence.value.html + ' '}
                              {existingComment && <span>📋</span>}
                              {showInput && selectedIndex && selectedIndex.sectionIndex === sectionIndex && selectedIndex.sentenceIndex === globalSentenceIndex && (
                                <div className='add-comment-container'>
                                  <textarea
                                    value={currentComment}
                                    onChange={(e) => setCurrentComment(e.target.value)}
                                    placeholder="Add a comment..."
                                  />
                                  <button onClick={() => handleTakenote(sentence.value.html, existingComment)} style={{ backgroundColor: "green" }}>
                                    Take Note
                                  </button>
                                  <button onClick={() => setShowInput(false)} style={{ backgroundColor: "red" }}>
                                    Cancel
                                  </button>
                                  <button style={{ backgroundColor: "#FF0000" }} onClick={() => handleDeleteComment(existingComment)} disabled={!existingComment}>
                                    Xoá
                                  </button>
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
          ) : (
            <div className='transcript-box'>
              <div className='transcript'>
                <div>
                  {transcript.transcriptSections.map((section, sectionIndex) => {
                    return (
                      <div key={sectionIndex} className='transcript-section'>
                        <h2>Key Idea {sectionIndex + 1}</h2>
                        {section.transcriptSentences.map((sentence) => {
                          const globalSentenceIndex = sentence.sentence_index;
                          const isPlagiarized = Array.isArray(plagiarismResults) && plagiarismResults.some(result => result.sentence === sentence.value.html);

                          return (
                            <span
                              key={globalSentenceIndex}
                              id={`word-${globalSentenceIndex}`}
                              style={{ cursor: 'pointer', position: 'relative' }}
                              onContextMenu={(e) => handleRightClick(e, sectionIndex, globalSentenceIndex)}
                              className={isPlagiarized ? 'highlight' : ''}
                            >
                              {sentence.value.html + ' '}
                            </span>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="staff-comments-side">
        {mode === 'comment' ? (
          <div className="staff-comments">
            <h3>Staff Comments</h3>
            <div className="comment">
              {comments.map((comment) => (
                <ul key={comment.id}>
                  <li>Staff: {profile.fullName}</li>
                  <li>{new Date(comment.createdAt).toLocaleDateString()}</li>
                  <li>Câu: {comment.targetText}</li>
                  <li>Take Note: {comment.feedback}</li>
                  <br />
                </ul>
              ))}
            </div>
            <div className="summary-note">
              <h4>Ghi chú tổng:</h4>
              <textarea placeholder="Ghi chú ở đây..." className="comment-input" readOnly value={summaryNote}></textarea>
              <div className="status-buttons">
                <button style={{ backgroundColor: "#f95700", color: "#f0f0f0" }}
                  onClick={handleNotAchieveButton}>
                  Chưa đạt</button>
                <button style={{ backgroundColor: "green", color: "#f0f0f0" }}
                  onClick={handleAchieveButton}>
                  Đạt</button>
              </div>
              <div className="status-buttons">
                <button style={{ backgroundColor: "#f95700", color: "#f0f0f0" }}
                  onClick={confirmReject} disabled={summaryNote === "Đạt"}>Từ Chối</button>
                <button style={{ backgroundColor: "#007bff", color: "#f0f0f0" }}
                  onClick={confirmApprove} disabled={summaryNote === "Chưa Đạt"}>Chấp Thuận</button>
              </div>
            </div>
          </div>
        ) : (
          <div className='plagiarism-container'>
            <div className='plagiarism-side'>
              {!hasResults ? (
                <>
                  <p>Chưa có kết quả kiểm tra, hãy nhấn nút Kiểm tra đạo văn</p>
                  <div>
                    <button className='check-plagiarism' onClick={handleCheckPlagiarism}
                      style={{ backgroundColor: "#90c494", color: "#f0f0f0", marginRight: 10 }}
                      disabled={plagiarismProcessing}
                    >
                      {plagiarismProcessing ? "Đang xử lý..." : "Kiểm tra đạo văn"}
                    </button>
                    <button className='check-plagiarism' onClick={getPlagiarismResults}
                      style={{ backgroundColor: "#90c494", color: "#f0f0f0", marginRight: 10 }}
                      disabled={plagiarismProcessing}
                    >
                      Lấy Kết Quả
                    </button>
                  </div>
                </>
              ) : (
                <div className='plagiarism-result-container'>
                  <h3>Kết quả kiểm tra đạo văn</h3>
                  {plagiarismResults && plagiarismResults.length > 0 ? (
                    <div className='comment'>
                      <ul>
                        {plagiarismResults.map((result, index) => (
                          <div key={index} className='plagiarism-result'>
                            <p><strong>Câu:</strong> {result.sentence}</p>
                            <p><strong>Câu tương tự:</strong> {result.existing_sentence}</p>
                            <div className="progress-container">
                              <div className="progress-bar">
                                <div className="progress" style={{ width: `${result.similarity_score * 100}%` }}><span className="percentage">
                                  {Math.round(result.similarity_score * 100)}%
                                </span></div>
                              </div>
                            </div>
                            {metadata && metadata.length > 0 && (
                              <>
                                <p><strong>Contributor:</strong> {metadata[0].contributor_full_name}</p>
                                <p><strong>Tên cuốn sách:</strong> {metadata[0].book_title}</p>
                              </>
                            )}
                            <br />
                            <hr />
                          </div>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p>Không phát hiện đạo văn.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Review;
