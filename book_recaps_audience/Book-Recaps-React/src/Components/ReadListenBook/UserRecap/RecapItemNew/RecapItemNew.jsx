import React, { useState, useRef, useEffect } from 'react'; 
import { FaSyncAlt, FaUndo, FaForward, FaVolumeUp, FaVolumeDown, FaPlay, FaPause } from 'react-icons/fa';
//import './RecapItem.scss';

const RecapItemNew = ({ recap, audioUrl, transcriptUrl }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [transcript, setTranscript] = useState(null);

  // Fetch transcript from URL
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await fetch(transcriptUrl);
        const data = await response.json();
        setTranscript(data.transcriptSections);
      } catch (error) {
        console.error("Error fetching transcript:", error);
      }
    };

    if (transcriptUrl) fetchTranscript();
  }, [transcriptUrl]);

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

  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = e.target.value;
      setCurrentTime(e.target.value);
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

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    setPlaybackRate(newRate);
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

  return (
    <div className="recap-item">
      <h3 className="recap-title">{recap.title}</h3>
      <p className="recap-description">{recap.description}</p>

      {audioUrl && (
        <div className="audio-player-container">
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
            onLoadedMetadata={handleLoadedMetadata}
            src={audioUrl}
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
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
              <FaVolumeUp className="volume-icon" />
            </div>

            <div className="playback-speed-controls">
              <select value={playbackRate} onChange={handlePlaybackRateChange}>
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

      {transcript && (
        <div className="transcript">
          {transcript.map((section, index) => (
            <div key={index} className="transcript-section">
              {section.transcriptSentences.map((sentence, idx) => (
                <p key={idx} dangerouslySetInnerHTML={{ __html: sentence.value.html }}></p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecapItemNew;
