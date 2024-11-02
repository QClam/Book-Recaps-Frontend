import React, { useEffect, useRef, useState } from 'react';
import { FaSyncAlt, FaUndo, FaForward, FaVolumeUp, FaVolumeDown, FaPlay, FaPause } from 'react-icons/fa';

const AudioPlayer = ({ audioURL }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1); // Playback speed state
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

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleAudioEnded = () => {
    if (isLooping) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
    }
  };

  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    setPlaybackRate(newRate);
  };
  return (
    <div className="audio-player-container">
      <audio
        ref={audioRef}
        src={audioURL}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className="audio-controls">
        <div className="progress-bar">
          <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
          />
          <span>{new Date((duration - currentTime) * 1000).toISOString().substr(14, 5)}</span>
        </div>

        <div className="audio-control-buttons">
          <button onClick={() => handleSeek(currentTime - 15)}>
            <FaUndo /> 15
          </button>
          <button onClick={togglePlayPause}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={() => handleSeek(currentTime + 15)}>
            <FaForward /> 15
          </button>
          <button onClick={() => setIsLooping(!isLooping)}>
            <FaSyncAlt color={isLooping ? 'grey' : 'black'} />
          </button>
        </div>

        <div className="volume-controls">
          <FaVolumeDown />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
          <FaVolumeUp />
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
  );
};

export default AudioPlayer;
