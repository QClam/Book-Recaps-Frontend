import React, { useEffect, useState, useRef } from 'react';
import { FaSyncAlt, FaUndo, FaForward, FaVolumeUp, FaVolumeDown, FaPlay, FaPause } from 'react-icons/fa';
import Transcript from './Transcript';
import './RecapItem.scss';

const RecapItem = ({ recapDetail, accessToken, userId }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGenAudio, setIsGenAudio] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Check if `recapDetail` and `recapVersions` are present
  const recapVersion = recapDetail?.data?.recapVersions?.$values[0] || null;

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

  return (
    <li className="recap-list-item">
      {recapVersion && (
        <>
          {recapVersion.transcriptUrl && (
            <Transcript
              transcriptUrl={recapVersion.transcriptUrl}
              accessToken={accessToken}
              onSentenceClick={handleSentenceClick}
              currentTime={currentTime}
              isGenAudio={isGenAudio}
              userId={userId}
              recapVersionId={recapVersion.id}
            />
          )}

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
