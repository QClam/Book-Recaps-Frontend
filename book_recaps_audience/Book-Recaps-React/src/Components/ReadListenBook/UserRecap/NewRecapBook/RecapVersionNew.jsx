import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaSyncAlt, FaUndo, FaForward, FaVolumeUp, FaVolumeDown, FaPlay, FaPause } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const RecapVersionNew = () => {
  const { versionId } = useParams();
  const [versionDetails, setVersionDetails] = useState(null);
  const [transcript, setTranscript] = useState(null); // New state for transcript
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const audioRef = useRef(null);
  const accessToken = localStorage.getItem('authToken');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [highlightedSentences, setHighlightedSentences] = useState([]);
  const [notes, setNotes] = useState({});
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, sentence: null });
  const [currentNote, setCurrentNote] = useState('');
 

  // Hàm để phát audio từ thời điểm của câu được chọn
  const handleSentenceClick = (sentence) => {
    if (audioRef.current) {
      audioRef.current.currentTime = sentence.startTime; // Chuyển thời gian của audio
      audioRef.current.play(); // Phát audio
      setHighlightedSentences([sentence.id]); // Highlight câu
    }
  };

  // Hàm cập nhật thời gian và highlight câu đang phát
  const handleTimeUpdate = () => {
    const currentAudioTime = audioRef.current.currentTime;
    setCurrentTime(currentAudioTime);

    // Tìm câu tương ứng với thời gian hiện tại của audio
    if (transcript) {
      transcript.transcriptSections.forEach((section) => {
        section.transcriptSentences.forEach((sentence) => {
          if (
            currentAudioTime >= sentence.startTime &&
            currentAudioTime < sentence.endTime
          ) {
            setHighlightedSentences([sentence.id]); // Highlight câu đang phát
          }
        });
      });
    }
  };


  useEffect(() => {
    const fetchVersionDetails = async () => {
      try {
        const response = await axios.get(`https://160.25.80.100:7124/version/${versionId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        setVersionDetails(response.data.data);
        
        const transcriptResponse = await axios.get(response.data.data.transcriptUrl);
        setTranscript(transcriptResponse.data);
      } catch (error) {
        console.error('Error fetching version details:', error);
      }
    };

    fetchVersionDetails();
  }, [versionId, accessToken]);

  // Sử dụng useEffect để cập nhật highlight khi audio phát
// useEffect(() => {
//     const handleTimeUpdate = () => {
//       const currentAudioTime = audioRef.current.currentTime;
//       setCurrentTime(currentAudioTime);
  
//       // Highlight câu tương ứng với thời gian hiện tại của audio
//       if (transcript) {
//         transcript.transcriptSections.forEach((section) => {
//           section.transcriptSentences.forEach((sentence) => {
//             if (
//               currentAudioTime >= sentence.startTime &&
//               currentAudioTime < sentence.endTime
//             ) {
//               setHighlightedSentences([sentence.id]);
//             }
//           });
//         });
//       }
//     };
  
//     if (audioRef.current) {
//       audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
//     }
  
//     return () => {
//       if (audioRef.current) {
//         audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
//       }
//     };
//   }, [transcript]);
  
  
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

//   const handleTimeUpdate = () => {
//     if (audioRef.current) {
//       setCurrentTime(audioRef.current.currentTime);
//     }
//   };

  const handleSeek = (e) => {
    if (audioRef.current) {
      audioRef.current.currentTime = e.target.value;
      setCurrentTime(e.target.value);
    }
  };

  const handlePlayPause = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
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

  const highlightCurrentSentence = () => {
    if (transcript && audioRef.current) {
      const currentSentence = transcript.transcriptSections
        .flatMap(section => section.transcriptSentences)
        .find(sentence => {
          const start = sentence.startTime;
          const end = sentence.endTime;
          return currentTime >= start && currentTime <= end;
        });
      if (currentSentence) {
        setHighlightedSentences([currentSentence.id]);
      }
    }
  };

  const handleContextMenu = (e, sentence) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      sentence,
    });
    setShowNoteModal(false); // Ẩn modal ghi chú khi mở context menu mới
  

// Chuyển thời gian audio đến câu được nhấp chuột phải
if (audioRef.current && sentence.startTime) {
    audioRef.current.currentTime = sentence.startTime;
    audioRef.current.play();
    setIsPlaying(true);
  }
};

// Hàm này chạy khi click vào câu
//   const handleSentenceClick = (sentence) => {
//     if (audioRef.current) {
//       audioRef.current.currentTime = sentence.startTime; // Chuyển thời gian của audio đến thời điểm bắt đầu của câu
//       audioRef.current.play(); // Phát audio
//       setHighlightedSentences([sentence.id]); // Cập nhật câu đang được highlight
//     }
//   };
  
  const handleHighlight = () => {
    if (contextMenu.sentence) {
      const newHighlighted = [...highlightedSentences, contextMenu.sentence.id];
      setHighlightedSentences(newHighlighted);
      localStorage.setItem('highlightedSentences', JSON.stringify(newHighlighted)); // Persist highlights
    }
    setContextMenu({ visible: false });
  };

  const handleTakeNote = () => {
    if (contextMenu.sentence) {
      const sentenceId = contextMenu.sentence.id;
      setCurrentNote(notes[sentenceId] || '');
      setShowNoteModal(true); // Hiển thị modal ghi chú
    }
    setContextMenu({ visible: false });
  };

  const handleNoteChange = (e) => {
    setCurrentNote(e.target.value);
  };

  const handleNoteSave = () => {
    if (contextMenu.sentence) {
      const sentenceId = contextMenu.sentence.id;
      const newNotes = { ...notes, [sentenceId]: currentNote };
      setNotes(newNotes);
      localStorage.setItem('notes', JSON.stringify(newNotes));
    }
    setShowNoteModal(false); // Đóng modal ghi chú sau khi lưu
  };



  const handleCopy = () => {
    if (contextMenu.sentence) {
      navigator.clipboard.writeText(contextMenu.sentence.value.html);
    }
    setContextMenu({ visible: false });
  };

  return (
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', backgroundColor: '#eaf6f6', minHeight: '100vh' }}>
      {versionDetails ? (
        <div style={{ maxWidth: '800px', width: '100%', backgroundColor: '#f0f8f8', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>{versionDetails.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
            <img src={versionDetails.coverImage} alt="Book cover" style={{ width: '150px', height: 'auto', borderRadius: '8px' }} />
            <div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{versionDetails.author}</p>
              <p style={{ fontSize: '14px', color: '#555' }}>{versionDetails.description}</p>
              <p style={{ fontSize: '14px', color: '#777' }}>Category: {versionDetails.category}</p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>Recaps</h3>
            <div style={{ padding: '15px', backgroundColor: '#fdfdfd', borderRadius: '8px', border: '1px solid #ddd' }}>
              <strong>Transcript:</strong>
              <div style={{ marginTop: '10px', lineHeight: '1.6' }}>
              {transcript ? (
                  transcript.transcriptSections.map((section, index) => (
                    <div key={index}>
                      {section.transcriptSentences.map((sentence, idx) => (
                        <p
                          key={idx}
                          onClick={() => handleSentenceClick(sentence)}
                          onContextMenu={(e) => handleContextMenu(e, sentence)}
                          style={{
                            backgroundColor: highlightedSentences.includes(sentence.id) ? 'orange' : 'transparent',
                          }}
                        >
                          {sentence.value.html}
                        </p>
                        
                      ))}
                    </div>
                  ))
                ) : (
                  <p>Loading transcript...</p>
                )}

              </div>
            </div>
          </div>

{/* Context Menu */}
{contextMenu.visible && (
            <div
              style={{
                position: 'absolute',
                top: contextMenu.y + 10, // Adjusted to position below the clicked element
                left: contextMenu.x,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                display: 'flex',
                gap: '10px',

              }}
            >
              <button onClick={handleHighlight} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span role="img" aria-label="highlight">✏️</span> Highlight
              </button>
              <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span role="img" aria-label="copy">📋</span> Copy
              </button>
              <button onClick={handleTakeNote} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span role="img" aria-label="take note">📝</span> Take Note
              </button>

            </div>
          )}

           {/* Modal for Taking Notes */}
           {showNoteModal && (
            <div style={{ marginTop: '20px' }}>
              <textarea
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                style={{ width: '100%', height: '100px', padding: '10px' }}
                placeholder="Add a note here..."
              />
              <button onClick={handleNoteSave} style={{ marginTop: '10px' }}>Save Note</button>
            </div>
          )}

          <div className="audio-player-container">
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleAudioEnded}
              onLoadedMetadata={() => setDuration(audioRef.current.duration)}
              src={versionDetails.audioURL}
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
                <select id="playbackRate" value={playbackRate} onChange={handlePlaybackRateChange}>
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
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default RecapVersionNew;
