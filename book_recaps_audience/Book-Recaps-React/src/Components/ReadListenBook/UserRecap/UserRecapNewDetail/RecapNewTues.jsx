import { useEffect, useRef, useState } from 'react';
import { defer, json, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { FaForward, FaPause, FaPlay, FaSyncAlt, FaUndo, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
import './RecapNewTues.scss';
import '../Transcript.scss';
import CreatePlaylistModal from '../PlaylistModal/CreatePlaylistModal';
import ReportIssueModal from '../ReportIssueModal/ReportIssueModal';
import Transcriptv2 from '../NewRecapBook/Transcriptv2';
import { resolveRefs } from "../../../../utils/resolveRefs";
import { useAuth } from "../../../../contexts/Auth";
import axios from 'axios';
import { axiosInstance } from "../../../../utils/axios";
import { routes } from "../../../../routes";
import Show from "../../../Show";
import { handleFetchError } from "../../../../utils/handleFetchError";
import SuspenseAwait from "../../../SuspenseAwait";

// TODO:
// - Style the UI of RecapInfoSection and Transcript Section
// - Check cases where:
//    Recap is Premium:
//    - user is not logged in -> no audio player, no like, no playlist, no view tracking, no report, no transcript highlighting, no context menu
//    - user is logged in but not premium -> no audio player, no transcript, no view tracking
//    - user is logged in and premium -> everything
//    Recap is Free:
//    - user is not logged in -> no audio player, no like, no playlist, no view tracking, no report, no transcript highlighting, no context menu
//    - user is logged in but not premium -> everything
// - Add image tag for each keyidea

// NOTE: Do all those TODOs first then style the audio player later (last)

const getRecap = async (recapId, request) => {
  try {
    const response = await axiosInstance.get("/getrecapbyId/" + recapId, { signal: request.signal });
    return resolveRefs(response.data.data);
  } catch (e) {
    const err = handleFetchError(e);
    throw json({ error: err.error }, { status: err.status });
  }
}

const getTranscript = async (transcriptUrl, request) => {
  if (!transcriptUrl) return null;
  try {
    const response = await axios.get(transcriptUrl, { signal: request.signal });
    return response.data;
  } catch (e) {
    const err = handleFetchError(e);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const recapPlayerLoader = async ({ params, request }) => {
  const recap = await getRecap(params.recapId, request);
  const promisedTranscript = getTranscript(recap.currentVersion?.transcriptUrl, request);

  return defer({ recap, promisedTranscript });
}

const RecapNewTues = () => {
  return (
    <div className="recap-wrapper-wrapper">
      <RecapInfoSection/>
      <AudioAndTranscriptSection/>
    </div>
  );
};

export default RecapNewTues;

const RecapInfoSection = () => {
  const { recap } = useLoaderData();
  const { recapId } = useParams();
  const [ isPlaylistModalOpen, setIsPlaylistModalOpen ] = useState(false);
  const [ isReportModalOpen, setIsReportModalOpen ] = useState(false); // State for report modal
  const [ likeCount, setLikeCount ] = useState(0); // State to store the number of likes
  const [ liked, setLiked ] = useState(false);

  const { user } = useAuth();
  const userId = user?.id;

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
  }, [ recapId, userId ]);

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

  const handleReportSubmit = async (reportData) => {
    try {
      const response = await axiosInstance.post('/api/supportticket/create', {
        category: reportData.category,
        description: reportData.description,
        status: 0,
        recapId: recapId,
        userId: userId
      });
      console.log('Report response:', response.data);
    } catch (error) {
      console.error('Error reporting issue:', error);
    }
  };

  const closePlaylistModal = () => {
    setIsPlaylistModalOpen(false);
  };

  const openPlaylistModal = () => {
    setIsPlaylistModalOpen(true);
  };

  const openReportModal = () => {
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  return (
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
              <span className="saved-label" onClick={openPlaylistModal}>
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
        isOpen={isPlaylistModalOpen}
        onClose={closePlaylistModal}
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
  )
}

const AudioAndTranscriptSection = () => {
  const { recap, promisedTranscript } = useLoaderData();
  const navigate = useNavigate();

  // Audio player state
  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ currentTime, setCurrentTime ] = useState(0);
  const audioRef = useRef(null);

  const { user } = useAuth();
  const hasSubscription = user?.profileData.subscriptions.$values.some((sub) => sub.status === 0);

  // Create view tracking after the transcript is loaded. Delayed by 3 seconds
  useEffect(() => {
    let timeoutId;
    if (recap && user?.id) {
      promisedTranscript.then(() => {
        timeoutId = setTimeout(() => {
          createViewTracking();
        }, 3000);
      });
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, []);

  const createViewTracking = async () => {
    try {
      const deviceType = window.innerWidth <= 768 ? 0 : 1; // Mobile: 0, Desktop: 1
      const response = await axiosInstance.post(`/api/viewtracking/createviewtracking?recapid=${recap.id}&deviceType=${deviceType}`);
      console.log('View tracking response:', response.data);
    } catch (error) {
      const err = handleFetchError(error);
      console.log('Error tracking view:', err);
    }
  };

  const handleUpgradeToPremium = () => {
    navigate(routes.billing);
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

  return (
    <div className="recap-right-section">
      <h2>{recap.name}</h2>

      <Show when={recap && recap.isPublished}>
        <Show when={(recap.isPremium && hasSubscription) || !recap.isPremium} fallback={
          <div className="premium-message">
            This recap is premium. Please upgrade to a premium subscription.
            <button onClick={handleUpgradeToPremium}>Upgrade</button>
          </div>
        }>
          <SuspenseAwait
            resolve={promisedTranscript}
            errorElement={<p>No transcript available or failed to load transcript.</p>}
            fallback={<div>Loading transcript...</div>}
          >
            {(transcript) => (
              <Transcriptv2
                transcriptData={transcript}
                handleSentenceClick={handleSentenceClick}
                userId={user?.id}
                recapVersionId={recap?.currentVersion?.id}
                currentTime={currentTime}
                isGenAudio={recap?.currentVersion?.isGenAudio || false}
              />
            )}
          </SuspenseAwait>

          <AudioPlayer
            recap={recap}
            audioRef={audioRef}
            currentAudioTime={currentTime}
            setCurrentAudioTime={setCurrentTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </Show>
      </Show>
    </div>
  )
}

const AudioPlayer = ({ recap, audioRef, currentAudioTime, setCurrentAudioTime, isPlaying, setIsPlaying }) => {
  const [ duration, setDuration ] = useState(0);
  const [ isLooping, setIsLooping ] = useState(false);
  const [ playbackRate, setPlaybackRate ] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateCurrentTime = () => setCurrentAudioTime(audio.currentTime || 0);
    audio.addEventListener('timeupdate', updateCurrentTime);
    return () => {
      audio.removeEventListener('timeupdate', updateCurrentTime);
    };
  }, []);

  const handlePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Playback error:', error);
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentAudioTime(newTime);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentAudioTime(Number(audioRef.current.currentTime));
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

  const handleVolumeChange = (e) => {
    if (audioRef.current) {
      audioRef.current.volume = e.target.value;
    }
  }

  return (
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
              <span>{new Date(currentAudioTime * 1000).toISOString().substr(14, 5)}</span>
              <input
                type="range"
                min="0"
                max={duration.toFixed(2) || 0}
                step="0.01"
                value={currentAudioTime.toFixed(2)}
                onChange={handleSeek}
              />
              <span>{new Date((duration - currentAudioTime) * 1000).toISOString().substr(14, 5)}</span>
            </div>
            <div className="audio-control-buttons">
              <button onClick={() => handleSeek({ target: { value: currentAudioTime - 15 } })}>
                <FaUndo/> 15
              </button>
              <button onClick={handlePlayPause} className="play-pause-button">
                {isPlaying ? <FaPause/> : <FaPlay/>}
              </button>
              <button onClick={() => handleSeek({ target: { value: currentAudioTime + 15 } })}>
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
                onChange={handleVolumeChange}
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
  )
}