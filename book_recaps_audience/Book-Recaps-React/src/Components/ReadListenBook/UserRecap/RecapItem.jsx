import React, { useEffect, useState, useRef } from 'react';  
import { FaSyncAlt } from 'react-icons/fa'; // Import FaSyncAlt
import Transcript from './Transcript';
import './RecapItem.scss';

const RecapItem = ({ recapDetail, accessToken, userId }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGenAudio, setIsGenAudio] = useState(false); // State for isGenAudio
  const [isLooping, setIsLooping] = useState(false); // State for loop

  useEffect(() => {
    if (recapDetail && recapDetail.data.currentVersion) {
      // Set isGenAudio from recapDetail
      setIsGenAudio(recapDetail.data.currentVersion.isGenAudio);
    }
  }, [recapDetail]); // Update isGenAudio when recapDetail changes

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSentenceClick = (startTime) => {
    if (audioRef.current) {
      const time = parseFloat(startTime);
      if (isFinite(time)) {
        audioRef.current.currentTime = time;
        audioRef.current.play();
      }
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping); // Toggle looping state
  };

  const handleAudioEnded = () => {
    if (isLooping && audioRef.current) {
      audioRef.current.currentTime = 0; // Reset time to start
      audioRef.current.play(); // Play audio from the start
    }
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
              isGenAudio={isGenAudio} // Pass isGenAudio
              userId={userId}
              recapVersionId={recapDetail.data.currentVersion.id}
            />
          )}

          <audio
            ref={audioRef}
            controls
            className="audio-controllerer"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded} // Handle audio ended
          >
            <source src={recapDetail.data.currentVersion.audioURL} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>

          <button onClick={toggleLoop} className="loop-buttonon"> 
            <FaSyncAlt color={isLooping ? "grey" : "black"} size={18} />
          </button>
        </>
      )}
    </li>
  );
};

export default RecapItem;
