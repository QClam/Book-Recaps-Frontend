import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

const Transcriptv2 = ({
  transcriptData,
  highlightedSentences,
  setHighlightedSentences,
  handleSentenceClick,
  userId,
  recapVersionId,
  isGenAudio,
  transcriptUrl,
  currentTime
 
}) => {
    // console.log('User ID:', userId);
    // console.log('Recap Version ID:', recapVersionId);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    sectionIndex: null,
    sentenceIndex: null,
  });
  const [transcriptContent, setTranscriptContent] = useState(null);
  const [transcriptError, setTranscriptError] = useState(null);
  const [activeSentence, setActiveSentence] = useState(null);
  
  const [notes, setNotes] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [currentSentenceId, setCurrentSentenceId] = useState(null);
  const sentenceRefs = useRef({});
  const contextMenuRef = useRef(null);
  const accessToken = localStorage.getItem("authToken");
  // Function to get the storage key for the user's highlights
  const getUserHighlightsKey = (userId) => `highlightedSentences_${userId}`;

  // Function to get the storage key for the user's notes
  const getUserNotesKey = (userId) => `transcriptNotes_${userId}`;
  
    // Tải ghi chú từ localStorage khi component mount
    useEffect(() => {
      try {
        const storedNotes = JSON.parse(localStorage.getItem(getUserNotesKey(userId)));
        setNotes(storedNotes && typeof storedNotes === 'object' ? storedNotes : {});
      } catch (error) {
        console.error('Error parsing transcriptNotes from localStorage:', error);
        setNotes({});
        // Optionally, you can remove the invalid entry from localStorage
        localStorage.removeItem(getUserNotesKey(userId));
      }
    }, [userId]);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await axios.get(transcriptUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = response.data;

        // Chuyển đổi start và end thành số nếu cần
        data.transcriptSections.forEach(section => {
          section.transcriptSentences.forEach(sentence => {
            sentence.start = parseFloat(sentence.start);
            sentence.end = parseFloat(sentence.end);
          });
        });

        setTranscriptContent(data);
      } catch (error) {
        setTranscriptError('Error fetching transcript data');
        console.error('Error fetching transcript data:', error);
      }
    };

    fetchTranscript();
  }, [transcriptUrl, accessToken]);
  

  // Function to handle highlighting


  useEffect(() => {
    // console.log("Current time:", currentTime); // Log current time để kiểm tra
    // console.log("isGenAudio:", isGenAudio);   // Log isGenAudio để đảm bảo nó đúng là true
  
    if (!isGenAudio) {
      setActiveSentence(null);
      return;
    }
  
    if (transcriptContent) {
      let found = false;
      for (let section of transcriptContent.transcriptSections) {
        for (let sentence of section.transcriptSentences) {
          if (isFinite(sentence.start) && isFinite(sentence.end)) {
            if (currentTime >= sentence.start && currentTime <= sentence.end) {
              setActiveSentence(sentence.sentence_index);
              console.log("Highlighting sentence index:", sentence.sentence_index); // Log câu được highlight
  
              if (sentenceRefs.current[sentence.sentence_index]) {
                sentenceRefs.current[sentence.sentence_index];
              }
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
  
      if (!found) {
        setActiveSentence(null);
      }
    }
  }, [currentTime, transcriptContent, isGenAudio]);


  const handleHighlight = async () => {
    const { sectionIndex, sentenceIndex } = contextMenu;
    const sentenceElement = document.getElementById(`sentence-${sectionIndex}-${sentenceIndex}`);
    const selectedText = sentenceElement ? sentenceElement.textContent : '';
    const startIndex = sentenceElement?.dataset.startIndex;
    const endIndex = sentenceElement?.dataset.endIndex;
  
    if (!selectedText) return;
  
    const sentenceId = `sentence-${sectionIndex}-${sentenceIndex}`;
    const isAlreadyHighlighted = highlightedSentences.includes(sentenceId);
  
    if (isAlreadyHighlighted) {
      // Remove the highlight
      const updatedHighlights = highlightedSentences.filter(id => id !== sentenceId);
      setHighlightedSentences(updatedHighlights);
  
      // Remove highlight from localStorage
      localStorage.setItem(getUserHighlightsKey(userId), JSON.stringify(updatedHighlights));
  
      alert("Highlight removed successfully!");
  
      console.log("Highlight removed successfully!", {
        recapVersionId,
        userId,
        targetText: selectedText,
        sentenceId,
        startIndex,
        endIndex,
      });
    } else {
      // Add the highlight
      try {
        const requestBody = {
            recapVersionId: recapVersionId,
            userId: userId,
            note: currentNote || "",
            targetText: selectedText,
            startIndex: startIndex || "0",
            endIndex: endIndex || "0",
            sentenceIndex: sentenceIndex.toString(),
          };
          console.log('Request Body:', requestBody);
          
  
        const response = await axios.post('https://bookrecaps.cloud/api/highlight/createhighlight', requestBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,

            'Content-Type': 'application/json',
          },
          
        });
        console.log('API Response:', response.data);
  
        if (response.data && response.data.succeeded) {
          const updatedHighlights = [...highlightedSentences, sentenceId];
          setHighlightedSentences(updatedHighlights);
  
          // Save to localStorage with user-specific key
          localStorage.setItem(getUserHighlightsKey(userId), JSON.stringify(updatedHighlights));
  
          alert("Highlight saved successfully!");
  
          console.log("Highlight saved successfully!", {
            recapVersionId,
            userId,
            targetText: selectedText,
            sentenceId,
            startIndex,
            endIndex,
          });
        } else {
          throw new Error(response.data.message || 'Failed to save highlight');
        }
      } catch (error) {
        console.error('Error saving highlight:', error.response ? error.response.data : error);

        alert("Failed to save highlight.");
      }
    }
  
    setContextMenu({ ...contextMenu, visible: false });
  };
  
  useEffect(() => {
    // Load saved highlights for the user from localStorage
    const savedHighlights = localStorage.getItem(getUserHighlightsKey(userId));
    if (savedHighlights) {
      setHighlightedSentences(JSON.parse(savedHighlights));
    }
    const fetchUserHighlights = async () => {
        try {
          const response = await axios.get(`https://bookrecaps.cloud/api/highlight/gethighlightbyrecapid/${recapVersionId}?userId=${userId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (response.data && response.data.data && response.data.data.$values) {
            const apiHighlights = response.data.data.$values.map(item => `sentence-${item.sentenceIndex}`);
            setHighlightedSentences(apiHighlights);
            // Save to localStorage for persistence
            localStorage.setItem(getUserHighlightsKey(userId), JSON.stringify(apiHighlights));
          }
        } catch (error) {
          console.error("Error fetching highlights:", error);
        }
      };
    
      fetchUserHighlights();
    }, [userId, recapVersionId]); 


    useEffect(() => {
        // Tải lại highlight từ localStorage khi component mount
        const storedHighlights = localStorage.getItem('highlightedSentences');
        if (storedHighlights) {
          setHighlightedSentences(JSON.parse(storedHighlights));
        }
      }, []);
      


  // Xử lý hành động Take Note
  const handleTakeNote = () => {
    const { sectionIndex, sentenceIndex } = contextMenu;
    const sentenceId = `sentence-${sectionIndex}-${sentenceIndex}`;
    setCurrentSentenceId(sentenceId);
    setCurrentNote(notes[sentenceId] || "");
    setIsModalOpen(true);
    setContextMenu({ ...contextMenu, visible: false });
  };


  // Xử lý lưu ghi chú
  const saveNote = () => {
    setNotes(prevNotes => {
      const updatedNotes = {
        ...prevNotes,
        [currentSentenceId]: currentNote,
      };
      // Lưu trữ vào localStorage theo userId để mỗi người dùng có ghi chú riêng
      try {
        localStorage.setItem(getUserNotesKey(userId), JSON.stringify(updatedNotes));
      } catch (error) {
        console.error('Error saving transcriptNotes to localStorage:', error);
      }
      return updatedNotes;
    });
    setIsModalOpen(false);
  };

  // Load saved highlights and notes
  useEffect(() => {
    const savedHighlights = localStorage.getItem(getUserHighlightsKey(userId));
    if (savedHighlights) {
      setHighlightedSentences(JSON.parse(savedHighlights));
    }

    const savedNotes = localStorage.getItem(getUserNotesKey(userId));
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    // const fetchUserHighlights = async () => {
    //   try {
    //     const response = await axios.get(`https://bookrecaps.cloud/api/highlight/gethighlightbyrecapid/${recapVersionId}?userId=${userId}`);
    //     if (response.data && response.data.data && response.data.data.$values) {
    //       const apiHighlights = response.data.data.$values.map(item => `sentence-${item.sentenceIndex}`);
    //       setHighlightedSentences(apiHighlights);
    //       localStorage.setItem(getUserHighlightsKey(userId), JSON.stringify(apiHighlights));
    //     }
    //   } catch (error) {
    //     console.error("Error fetching highlights:", error);
    //   }
    // };

    // fetchUserHighlights();
  }, [userId, recapVersionId]);

  // Xử lý sự kiện right-click trên câu
  const handleContextMenu = (event, sectionIndex, sentenceIndex) => {
    event.preventDefault();
    const sentenceElement = document.getElementById(`sentence-${sectionIndex}-${sentenceIndex}`);
    const selectedText = sentenceElement ? sentenceElement.textContent : '';

    setContextMenu({
      visible: true,
      x: event.pageX,
      y: event.pageY,
      selectedText,
      sectionIndex,
      sentenceIndex,
    });
  };
    // Update the active sentence based on currentTime
    useEffect(() => {
      if (transcriptData) {
        transcriptData.transcriptSections.forEach((section) => {
          section.transcriptSentences.forEach((sentence) => {
            if (
              currentTime >= sentence.start &&
              currentTime <= sentence.end
            ) {
              setActiveSentence(sentence.sentence_index);
            }
          });
        });
      }
    }, [currentTime, transcriptData]);

    // Xử lý đóng modal
    const closeModal = () => {
      setIsModalOpen(false);
    };
    
     // Xử lý hành động Copy
  const handleCopy = () => {
    const { selectedText } = contextMenu;
    navigator.clipboard.writeText(selectedText)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy text.");
      });
    setContextMenu({ ...contextMenu, visible: false });
  };

  return (
    <div className="transcript-container">
      {transcriptData.transcriptSections.map((section, index) => (
        <div key={index} className="transcript-section">
           {section.title && <h3 className="transcript-title">{section.title}</h3>}
          
          {section.transcriptSentences.map((sentence, idx) => {
            const time = sentence.start;
            const sentenceId = `sentence-${index}-${idx}`;
            const isHighlighted = highlightedSentences.includes(sentenceId);
            const isUserHighlighted = notes[sentenceId];
            return (
              <span
                key={idx}
                id={sentenceId}
                ref={el => sentenceRefs.current[sentence.sentence_index] = el}
                className={`transcript-sentence ${activeSentence === sentence.sentence_index ? 'active' : ''} ${isHighlighted ? 'user-highlighted' : ''}`}
                onClick={() => {
                  if (isFinite(time)) {
                    handleSentenceClick(time);
                  } else {
                    console.error('Invalid startTime for sentence:', sentence);
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, index, idx)}
              >
                {sentence.value.html} {/* Sử dụng dangerouslySetInnerHTML nếu cần thiết */}
                {/* Hiển thị icon ghi chú nếu có ghi chú */}
                {isUserHighlighted && <span className="note-icon" title={notes[sentenceId]}>📝</span>}
              </span>
            );
          })}
        </div>
      ))}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="context-menu-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          ref={contextMenuRef}
        >
          <div className="context-menu-item-item" onClick={handleHighlight}>
            🖍 Highlight
          </div>
          <div className="context-menu-item-item" onClick={handleCopy}>
            📋 Copy
          </div>
          <div className="context-menu-item-item" onClick={handleTakeNote}>
            📝 Take Note
          </div>
        </div>
      )}

      {/* Note Modal */}
       {/* Modal Ghi Chú */}
       <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Take Note"
        className="note-modal"
        overlayClassName="note-modal-overlay"
      >
        <h2>Take Note</h2>
        <textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          placeholder="Enter your note here..."
          rows="5"
          cols="50"
          className="enternote"
        />
        <div className="modal-buttonss">
          <button onClick={saveNote}>Save</button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

Transcriptv2.propTypes = {
  transcriptData: PropTypes.object.isRequired,
  highlightedSentences: PropTypes.array.isRequired,
  setHighlightedSentences: PropTypes.func.isRequired,
  handleSentenceClick: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  recapVersionId: PropTypes.string.isRequired,
  accessToken: PropTypes.string.isRequired,
};

export default Transcriptv2;
