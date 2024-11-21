import React, { useEffect, useState, useRef } from 'react';
import { FaSyncAlt, FaUndo, FaForward, FaVolumeUp, FaVolumeDown, FaPlay, FaPause } from 'react-icons/fa';
import Transcript from './Transcript';
import './RecapItem.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import PropTypes from 'prop-types';

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


const RecapItem = ({ recapDetail, userId, recapId, recapVersionId }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGenAudio, setIsGenAudio] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [viewTrackingStatus, setViewTrackingStatus] = useState(null);
  const [recapInfo, setRecapInfo] = useState(null); // State to store API response
  const [isPremium, setIsPremium] = useState(false);  // Trạng thái Premium
  const [isPremiumRecap, setIsPremiumRecap] = useState(false); // Is recap premium
  const [hasSubscription, setHasSubscription] = useState(false); // Subscription status
  const [recapInfos, setRecapInfos] = useState([]);
  const accessToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // Device type: 0 for Mobile, 1 for Website
  const deviceType = window.innerWidth <= 768 ? 0 : 1;

  // Check if `recapDetail` and `recapVersions` are present
  const recapVersion = recapDetail?.data?.recapVersions?.$values[0] || null;

  // Fetch recap info (to check if it's premium)
// Fetch recap info (to check if it's premium)
useEffect(() => {
  const fetchRecapInfo = async () => {
    try {
      const response = await axios.get(`https://160.25.80.100:7124/getrecapbyId/${recapId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const recapData = resolveRefs(response.data.data);
      console.log("Recap data:", recapData); 
      setRecapInfo(recapData);  // Lưu thông tin của recap theo recapId
      setIsPremiumRecap(recapData.isPremium);
    } catch (error) {
      console.error("Error fetching recap info:", error);
    }
  };

  if (recapId) {
    fetchRecapInfo();
  }
}, [recapId, accessToken]);  // Chỉ gọi lại khi recapId hoặc accessToken thay đổi

  


// Fetch user's subscription status
useEffect(() => {
  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get('https://160.25.80.100:7124/api/personal/profile', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const subscriptions = response.data.subscriptions.$values;
      const hasValidSubscription = subscriptions.some(
        (subscription) => new Date(subscription.endDate) > new Date() && subscription.status === 0
      );
      setHasSubscription(hasValidSubscription); // Set subscription status
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };

  fetchSubscriptionStatus();
}, [accessToken]);

const trackView = async () => {
  try {
    const response = await axios.post(
      `https://160.25.80.100:7124/api/viewtracking/createviewtracking?recapid=${recapId}&deviceType=${deviceType}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("View tracking response:", response.data);
    setViewTrackingStatus('success'); // Update status to success
  } catch (error) {
    if (error.response) {
      console.error("API error:", error.response.status, error.response.data);
      setViewTrackingStatus('error'); // Update status to error
    } else if (error.request) {
      console.error("Network error or no response received:", error.request);
      setViewTrackingStatus('error');
    } else {
      console.error("Error in request setup:", error.message);
      setViewTrackingStatus('error');
    }
  }
};

  useEffect(() => {
    if (recapVersion) {
      setIsGenAudio(recapVersion.isGenAudio);
    }
  }, [recapVersion]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  // // const handlePlayPause = () => {
  //   if (audioRef.current) {
  //     if (isPlaying) {
  //       audioRef.current.pause();
  //     } else {
  //       audioRef.current.play();
  //     }
  //     setIsPlaying(!isPlaying);
  //   }
  // };

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

  const handlePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          await audioRef.current.play();
          trackView(); // Make the API call when the audio starts playing
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Playback error:", error);
      }
    }
  };

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    setPlaybackRate(newRate);
  };
  const handleUpgradeToPremium = () => { 
    // Chuyển hướng người dùng đến trang thanh toán
    navigate('/billing');
  };

  return (
    <li className="recap-list-item">
      {recapInfo && (
        <div className="recap-info">
          <h2>Name: {recapInfo.name}</h2>
          <p>Published: {recapInfo.isPublished ? 'Yes' : 'No'}</p>
          <p>Premium: {recapInfo.isPremium ? 'Yes' : 'No'}</p>
        </div>
      )}
      {recapInfo && recapInfo.isPublished === false && (
        <div className="recap-unavailable">
          <p>This recap is not published yet.</p>
        </div>
      )}

      {recapVersion && recapInfo && recapInfo.isPublished &&  (
        <>
          {isPremiumRecap ? (
            // Nếu recap là premium, chỉ hiển thị cho người dùng có subscription hợp lệ
            hasSubscription ? (
              <>
                <Transcript
                  transcriptUrl={recapVersion.transcriptUrl}
                  accessToken={accessToken}
                  onSentenceClick={handleSentenceClick}
                  currentTime={currentTime}
                  isGenAudio={isGenAudio}
                  userId={userId}
                  recapVersionId={recapVersion.id}
                />
                <div className="audio-player-container">
                  <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleAudioEnded}
                    onLoadedMetadata={handleLoadedMetadata}
                    src={recapVersion.audioURL}
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
                        <FaUndo /> 15
                      </button>
                      <button onClick={handlePlayPause} className="play-pause-button">
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </button>
                      <button onClick={() => handleSeek({ target: { value: currentTime + 15 } })}>
                        <FaForward /> 15
                      </button>
                      <button onClick={toggleLoop}>
                        <FaSyncAlt color={isLooping ? 'grey' : 'black'} />
                      </button>
                    </div>
                    <div className="volume-controls">
                      <FaVolumeDown className="volume-icon" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                      />
                      <FaVolumeUp className="volume-icon" />
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
              </>
            ) : (
              <div className="premium-message">
                This recap is premium. Please upgrade to a premium subscription.
                <button onClick={handleUpgradeToPremium}>Upgrade</button>
              </div>
            )
          ) : (
            <>
              <Transcript
                transcriptUrl={recapVersion.transcriptUrl}
                accessToken={accessToken}
                onSentenceClick={handleSentenceClick}
                currentTime={currentTime}
                isGenAudio={isGenAudio}
                userId={userId}
                recapVersionId={recapVersion.id}
              />
              <div className="audio-player-container">
                <audio
                  ref={audioRef}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleAudioEnded}
                  onLoadedMetadata={handleLoadedMetadata}
                  src={recapVersion.audioURL}
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
                      <FaUndo /> 15
                    </button>
                    <button onClick={handlePlayPause} className="play-pause-button">
                      {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button onClick={() => handleSeek({ target: { value: currentTime + 15 } })}>
                      <FaForward /> 15
                    </button>
                    <button onClick={toggleLoop}>
                      <FaSyncAlt color={isLooping ? 'grey' : 'black'} />
                    </button>
                  </div>
                  <div className="volume-controls">
                    <FaVolumeDown className="volume-icon" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                    />
                    <FaVolumeUp className="volume-icon" />
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
            </>
          )}
        </>
      )}
    </li>
  );
  
};

export default RecapItem;
