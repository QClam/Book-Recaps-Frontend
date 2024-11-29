import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaForward, FaPause, FaPlay, FaSyncAlt, FaUndo, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
import './RecapNewTues.scss';
import CreatePlaylistModal from '../PlaylistModal/CreatePlaylistModal';
import ReportIssueModal from '../ReportIssueModal/ReportIssueModal';
import Transcript from '../Transcript';
import Transcriptv2 from '../NewRecapBook/Transcriptv2';
import { resolveRefs } from "../../../../utils/resolveRefs";
import { axiosInstance } from "../../../../utils/axios";
import { useAuth } from "../../../../contexts/Auth";

const RecapNewTues = () => {
  const { recapId } = useParams();
  const [ recap, setRecap ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ transcript, setTranscript ] = useState(null);
  const [ highlightedSentences, setHighlightedSentences ] = useState([]);
  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ volume, setVolume ] = useState(1);
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [ duration, setDuration ] = useState(0);
  const [ isLooping, setIsLooping ] = useState(false);
  const [ playbackRate, setPlaybackRate ] = useState(1);
  const [ viewTrackingStatus, setViewTrackingStatus ] = useState(null);
  const [ recapInfo, setRecapInfo ] = useState(null); // State to store API response
  const [ isPremium, setIsPremium ] = useState(false);  // Trạng thái Premium
  const [ isPremiumRecap, setIsPremiumRecap ] = useState(false); // Is recap premium
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ isReportModalOpen, setIsReportModalOpen ] = useState(false); // State for report modal
  const [ successMessage, setSuccessMessage ] = useState(null); // State for success message
  const [ likeCount, setLikeCount ] = useState(0); // State to store the number of likes
  const [ liked, setLiked ] = useState(false);
  const [ errorMessage, setErrorMessage ] = useState(null);
  const [ recapVersionId, setRecapVersionId ] = useState(null);
  const [ currentTime, setCurrentTime ] = useState(0);
  const [ isGenAudio, setIsGenAudio ] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;
  const hasSubscription = user?.profileData.subscriptions.$values.some((sub) => sub.status === 0);
  const accessToken = localStorage.getItem("authToken");

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveClick = () => {
    setIsModalOpen(true);
  };

  const openReportModal = () => {
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  // const recapIded = useParams().recapId;
  const deviceType = window.innerWidth <= 768 ? 0 : 1; // Mobile: 0, Desktop: 1

  // Fetch recap info (to check if it's premium)
  useEffect(() => {
    const fetchRecapInfo = async () => {
      try {
        const response = await axiosInstance.get(`/getrecapbyId/${recapId}`);
        const recapData = resolveRefs(response.data.data);
        console.log("Recap data:", recapData);
        setRecapInfo(recapData);  // Lưu thông tin của recap theo recapId
        setIsPremiumRecap(recapData.isPremium);

        setRecap(recapData);

        const recapVersion = resolveRefs(response.data.data.currentVersion.id);
        setRecapVersionId(recapVersion);

        // Extract and set isGenAudio
        const currentVersion = recapData.currentVersion;
        setIsGenAudio(currentVersion?.isGenAudio || false);
        // resolveRefs(setRecap(response.data.data));
        // resolveRefs(setRecapVersionId(response.data.data.currentVersion.id));

        if (response.data.data.currentVersion.transcriptUrl) {
          const transcriptResponse = await axios.get(response.data.data.currentVersion.transcriptUrl);
          setTranscript(transcriptResponse.data);
        }
      } catch (error) {
        console.error("Error fetching recap info:", error);
      }
    };

    if (recapId) {
      fetchRecapInfo();
    }
  }, [ recapId ]);

  const trackView = async () => {
    if (!userId) {
      console.warn('User ID not available. Cannot track view.');
      return;
    }

    if (!recapId || !deviceType || !accessToken) {
      console.warn('Missing required parameters:', { recapId, deviceType, accessToken });
      return;
    }

    // console.log('Tracking view with:', { recapId, deviceType, accessToken });
    // const decodeToken = (token) => {
    //   const base64Url = token.split('.')[1];
    //   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //   const jsonPayload = decodeURIComponent(
    //     atob(base64)
    //       .split('')
    //       .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
    //       .join('')
    //   );
    //   return JSON.parse(jsonPayload);
    // };

    // console.log('Decoded Token:', decodeToken(accessToken));

    try {
      const response = await axiosInstance.post(`/api/viewtracking/createviewtracking?recapid=${recapId}&deviceType=${deviceType}`);
      console.log('View tracking response:', response.data);
      setViewTrackingStatus('success');
    } catch (error) {
      if (error.response) {
        console.error('Response error:', error.response.data);
        console.error('Status code:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      setViewTrackingStatus('error');
    }
  };

  const handlePlayPause = async () => {
    if (!userId) {
      console.error('Cannot play audio without user ID');
      return;
    }

    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          await audioRef.current.play();
          trackView();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Playback error:', error);
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = e.target.value;
      setCurrentTime(e.target.value);
    }
  };

  const handleSentenceClick = async (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = parseFloat(startTime);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Playback error on sentence click:", error);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [ volume ]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleAudioEnded = () => {
    if (isLooping) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    setPlaybackRate(newRate);
  };

  const handleContextMenu = (e, sentence) => {
    e.preventDefault();
    console.log("Right-clicked on sentence:", sentence);
  };

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(audioRef.current.currentTime);
    const audio = audioRef.current;
    audio?.addEventListener('timeupdate', updateCurrentTime);

    return () => {
      audio?.removeEventListener('timeupdate', updateCurrentTime);
    };
  }, []);

  const handleReportSubmit = async (reportData) => {
    try {
      const response = await axiosInstance.post('/api/supportticket/create', {
        category: reportData.category,
        description: reportData.description,
        status: 0,
        recapId: recapId,
        userId: userId
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
        const response = await axiosInstance.get(`/api/likes/count/${recapId}`);

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
  }, [ recapId, userId ]); // Fetch lại khi recapId, accessToken hoặc userId thay đổi

  // 2. Hàm xử lý khi người dùng nhấn like hoặc hủy like
  const handleLikeClick = async () => {
    try {
      let response;
      if (liked) {
        // Gửi yêu cầu DELETE để hủy like
        response = await axiosInstance.delete(`/api/likes/remove/${recapId}`);

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
        response = await axiosInstance.post(`/api/likes/createlike/${recapId}`, {
          recapId: recapId,
          userId: userId,
        });

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

  if (error) return <p>{error}</p>;
  if (!recap) return <p>Loading...</p>;

  const handleUpgradeToPremium = () => {
    // Chuyển hướng người dùng đến trang thanh toán
    navigate('/billing');
  };

  return (
    <div className="recap-wrapper-wrapper">
      <div className="recap-left-section">
        {/* <h2>{recap.name}</h2> */}
        <div className="recap-book-details">
          <img src={recap.book?.coverImage} alt={recap.book?.title}/>
          <h4>{recap.book?.title}</h4>
          <p>Original Title: {recap.book?.originalTitle}</p>
          <p>{recap.book?.description}</p>
          <p>Year: {recap.book?.publicationYear}</p>
          <p>Age Limit: {recap.book?.ageLimit}</p>

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
            <h3>{likeCount} Likes</h3>
          </div>
        </div>

        <CreatePlaylistModal
          isOpen={isModalOpen}
          onClose={closeModal}
          recapId={recapId} // Use dynamic recap ID
          userId={userId} // Use dynamic user ID
        />

        <div className="report-issue">
                <span onClick={openReportModal} style={{ cursor: "pointer", color: "blue" }}>
                  🏳️ Report an issue
                </span>
        </div>
        <ReportIssueModal isOpen={isReportModalOpen} onClose={closeReportModal} onSubmit={handleReportSubmit}/>
      </div>

      <div className="recap-right-section">

        <h2>{recap.name}</h2>
        {recapInfo && recapInfo.isPublished && (
          <>
            {isPremiumRecap ? (
              // Nếu recap là premium, chỉ hiển thị cho người dùng có subscription hợp lệ
              hasSubscription ? (
                <>
                  {transcript ? (
                    <Transcriptv2
                      transcriptData={transcript}
                      highlightedSentences={highlightedSentences}
                      setHighlightedSentences={setHighlightedSentences}
                      handleSentenceClick={handleSentenceClick}
                      handleContextMenu={handleContextMenu}
                      userId={userId} recapVersionId={recapVersionId}
                      currentTime={currentTime}
                      isGenAudio={isGenAudio}
                    />
                  ) : (
                    <p>No transcript available or failed to load transcript.</p>
                  )}


                  <div className="audio-player-container">
                    {recap.currentVersion.audioURL && (
                      <div className="recap-audio-player">
                        <audio
                          ref={audioRef}
                          src={recap.currentVersion.audioURL}
                          onLoadedMetadata={handleLoadedMetadata} // This will set the duration
                          onTimeUpdate={handleTimeUpdate}         // This will update currentTime
                          onEnded={handleAudioEnded}              // Handles end of playback
                        />

                        <div className="audio-controls">
                          <div className="progress-bar">
                            <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
                            <input
                              type="range"
                              min="0"
                              max={duration || 0}
                              value={currentTime}
                              onChange={handleSeek}
                            />
                            <span>{new Date((duration - currentTime) * 1000).toISOString().substr(14, 5)}</span>
                          </div>
                          <div className="audio-control-buttons">
                            <button onClick={() => handleSeek({ target: { value: currentTime - 15 } })}>
                              <FaUndo/> 15
                            </button>
                            <button onClick={handlePlayPause} className="play-pause-button">
                              {isPlaying ? <FaPause/> : <FaPlay/>}
                            </button>
                            <button onClick={() => handleSeek({ target: { value: currentTime + 15 } })}>
                              <FaForward/> 15
                            </button>
                            <button onClick={toggleLoop}>
                              <FaSyncAlt color={isLooping ? 'grey' : 'black'}/>
                            </button>
                          </div>
                          <div className="volume-controls">
                            <FaVolumeDown className="volume-icon"/>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={volume}
                              onChange={(e) => setVolume(e.target.value)}
                            />
                            <FaVolumeUp className="volume-icon"/>
                          </div>
                          <div className="playback-speed-controls">

                            <select
                              id="playbackRate"
                              value={playbackRate}
                              onChange={handlePlaybackRateChange}
                            >
                              <option value="0.5">0.5x</option>
                              <option value="0.75">0.75x</option>
                              <option value="1">1x</option>
                              <option value="1.25">1.25x</option>
                              <option value="1.5">1.5x</option>
                              <option value="1.75">1.75x</option>
                              <option value="2">2x</option>
                            </select>
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                </>
              ) : (
                <div className="premium-message">
                  This recap is premium. Please upgrade to a premium subscription.
                  <button onClick={handleUpgradeToPremium}>Upgrade</button>
                </div>
              )
            ) : (
              <>
                {transcript ? (
                  <Transcriptv2
                    transcriptData={transcript}
                    highlightedSentences={highlightedSentences}
                    setHighlightedSentences={setHighlightedSentences}
                    handleSentenceClick={handleSentenceClick}
                    handleContextMenu={handleContextMenu}
                    userId={userId} recapVersionId={recapVersionId}
                    currentTime={currentTime}
                    isGenAudio={isGenAudio}
                  />
                ) : (
                  <p>No transcript available or failed to load transcript.</p>
                )}

                <div className="audio-player-container">
                  {recap.currentVersion.audioURL && (
                    <div className="recap-audio-player">
                      <audio
                        ref={audioRef}
                        src={recap.currentVersion.audioURL}
                        onLoadedMetadata={handleLoadedMetadata} // This will set the duration
                        onTimeUpdate={handleTimeUpdate}         // This will update currentTime
                        onEnded={handleAudioEnded}              // Handles end of playback
                      />

                      <div className="audio-controls">
                        <div className="progress-bar">
                          <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
                          <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                          />
                          <span>{new Date((duration - currentTime) * 1000).toISOString().substr(14, 5)}</span>
                        </div>
                        <div className="audio-control-buttons">
                          <button onClick={() => handleSeek({ target: { value: currentTime - 15 } })}>
                            <FaUndo/> 15
                          </button>
                          <button onClick={handlePlayPause} className="play-pause-button">
                            {isPlaying ? <FaPause/> : <FaPlay/>}
                          </button>
                          <button onClick={() => handleSeek({ target: { value: currentTime + 15 } })}>
                            <FaForward/> 15
                          </button>
                          <button onClick={toggleLoop}>
                            <FaSyncAlt color={isLooping ? 'grey' : 'black'}/>
                          </button>
                        </div>
                        <div className="volume-controls">
                          <FaVolumeDown className="volume-icon"/>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                          />
                          <FaVolumeUp className="volume-icon"/>
                        </div>
                        <div className="playback-speed-controls">

                          <select
                            id="playbackRate"
                            value={playbackRate}
                            onChange={handlePlaybackRateChange}
                          >
                            <option value="0.5">0.5x</option>
                            <option value="0.75">0.75x</option>
                            <option value="1">1x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="1.75">1.75x</option>
                            <option value="2">2x</option>
                          </select>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecapNewTues;
