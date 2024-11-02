import React, { useEffect, useState, useRef } from 'react';
import { FaSyncAlt, FaUndo, FaForward, FaVolumeUp, FaVolumeDown, FaPlay, FaPause } from 'react-icons/fa';
import Transcript from './Transcript';
import './RecapItem.scss';
import AudioPlayer from './AudiPlayModal/AudioPlayer';

const RecapItem = ({ recapDetail, accessToken, userId }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGenAudio, setIsGenAudio] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  //const [volume, setVolume] = useState(1); // Volume state (1 = max volume)
  const [playbackRate, setPlaybackRate] = useState(1); // Playback speed state
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (recapDetail && recapDetail.data.currentVersion) {
      setIsGenAudio(recapDetail.data.currentVersion.isGenAudio);
    }
  }, [recapDetail]);

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

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = e.target.value;
      setCurrentTime(e.target.value);
    }
  };

  const handleSentenceClick = (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = parseFloat(startTime);
      audioRef.current.play();
      setIsPlaying(true);
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

   // Toggle play/pause
   const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };


  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    setPlaybackRate(newRate);
  };

  return (
    <li className="recap-list-item">
      {recapDetail && recapDetail.data.currentVersion && (
        <>
          {recapDetail.data.currentVersion.transcriptUrl && (
            <Transcript
              transcriptUrl={recapDetail.data.currentVersion.transcriptUrl}
              accessToken={accessToken}
              onSentenceClick={handleSentenceClick}
              currentTime={currentTime}
              isGenAudio={isGenAudio}
              userId={userId}
              recapVersionId={recapDetail.data.currentVersion.id}
            />
          )}

          <div className="audio-player-container">
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleAudioEnded}
              onLoadedMetadata={handleLoadedMetadata}
              src={recapDetail.data.currentVersion.audioURL}
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
                <button onClick={togglePlayPause} className="play-pause-button">
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
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
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

    {/* <AudioPlayer audioURL={recapDetail.data.currentVersion.audioURL}  audioRef={audioRef}/> */}
        </>
      )}
    </li>

    
  );
};

export default RecapItem;
