import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './Transcript.scss';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

// Đảm bảo rằng bạn thiết lập root element cho Modal
Modal.setAppElement('#root');

const Transcript = ({ transcriptUrl, accessToken, onSentenceClick, currentTime, userId, recapVersionId,isGenAudio }) => {
  // console.log("userId:", userId);
  // console.log("recapVersionId:", recapVersionId);
  const [transcriptContent, setTranscriptContent] = useState(null);
  const [transcriptError, setTranscriptError] = useState(null);
  const [activeSentence, setActiveSentence] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedText: '',
    sectionIndex: null,
    sentenceIndex: null,
  });
  const [highlightedSentences, setHighlightedSentences] = useState([]);
  const [notes, setNotes] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [currentSentenceId, setCurrentSentenceId] = useState(null);
  
  // Function to get the storage key for the user's highlights
const getUserHighlightsKey = (userId) => `highlightedSentences_${userId}`;
// Function to get the storage key for the user's notes
const getUserNotesKey = (userId) => `transcriptNotes_${userId}`;

  const sentenceRefs = useRef({});
  const contextMenuRef = useRef(null);

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

  // Các useEffect để fetch transcript, highlight, etc. như trước

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
  
  // Highlight câu tương ứng với thời gian hiện tại của audio
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
  

  // Đóng Context Menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    if (contextMenu.visible) {
      window.addEventListener('click', handleClickOutside);
    } else {
      window.removeEventListener('click', handleClickOutside);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);
  
  // const handleHighlight = async () => {
  //   const { sectionIndex, sentenceIndex } = contextMenu;
  //   const sentenceElement = document.getElementById(`sentence-${sectionIndex}-${sentenceIndex}`);
  //   const selectedText = sentenceElement ? sentenceElement.textContent : '';
  //   const startIndex = sentenceElement?.dataset.startIndex;
  //   const endIndex = sentenceElement?.dataset.endIndex;
  
  //   if (!selectedText) return;
  
  //   const sentenceId = `sentence-${sectionIndex}-${sentenceIndex}`;
  //   const isAlreadyHighlighted = highlightedSentences.includes(sentenceId);
  
  //   if (!isAlreadyHighlighted) {
  //     try {
  //       const requestBody = {
  //         recapVersionId: recapVersionId,
  //         userId: userId,
  //         note: currentNote || "",
  //         targetText: selectedText,
  //         startIndex: startIndex || "0",
  //         endIndex: endIndex || "0",
  //         sentenceIndex: sentenceIndex.toString(),
  //       };
  
  //       const response = await axios.post('https://160.25.80.100:7124/api/highlight/createhighlight', requestBody, {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           'Content-Type': 'application/json',
  //         },
  //       });
  
  //       if (response.data && response.data.succeeded) {
  //         const updatedHighlights = [...highlightedSentences, sentenceId];
  //         setHighlightedSentences(updatedHighlights);
          
  //         // Save to localStorage with user-specific key
  //         localStorage.setItem(getUserHighlightsKey(userId), JSON.stringify(updatedHighlights));
          
  //         setContextMenu({ ...contextMenu, visible: false });
  //         alert("Highlight saved successfully!");
          
  //         console.log("Highlight saved successfully!", {
  //           recapVersionId,
  //           userId,
  //           targetText: selectedText,
  //           sentenceId,
  //           startIndex,
  //           endIndex,
  //         });
  //       } else {
  //         throw new Error(response.data.message || 'Failed to save highlight');
  //       }
  //     } catch (error) {
  //       console.error("Error saving highlight:", error);
  //       alert("Failed to save highlight.");
  //     }
  //   }
  // };
  
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
  
        const response = await axios.post('https://160.25.80.100:7124/api/highlight/createhighlight', requestBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
  
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
        console.error("Error saving highlight:", error);
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

    // Fetch highlights from the server as well
    const fetchUserHighlights = async () => {
      try {
        const response = await axios.get(`https://160.25.80.100:7124/api/highlight/gethighlightbyrecapid/${recapVersionId}?userId=${userId}`);
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

  // Xử lý đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (transcriptError) {
    return <p className="error-notice">{transcriptError}</p>;
  }

  return (
    <div className="transcript-areaea">
      <h4>Transcript:</h4>
      {transcriptContent && transcriptContent.transcriptSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="transcript-part">
           {/* Display the title of the section */}
           {section.title && <h3 className="transcript-title">{section.title}</h3>}

          {section.transcriptSentences.map((sentence, sentenceIndex) => {
            const time = sentence.start;
            const sentenceId = `sentence-${sectionIndex}-${sentenceIndex}`;
            const isHighlighted = highlightedSentences.includes(sentenceId);
            const isUserHighlighted = notes[sentenceId];
            return (
              <span
                key={sentenceIndex}
                id={sentenceId}
                ref={el => sentenceRefs.current[sentence.sentence_index] = el}
                className={`transcript-sentence ${activeSentence === sentence.sentence_index ? 'active' : ''} ${isHighlighted ? 'user-highlighted' : ''}`}
                onClick={() => {
                  if (isFinite(time)) {
                    onSentenceClick(time);
                  } else {
                    console.error('Invalid startTime for sentence:', sentence);
                  }
                }}
                onContextMenu={(e) => handleContextMenu(e, sectionIndex, sentenceIndex)}
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

Transcript.propTypes = {
  transcriptUrl: PropTypes.string.isRequired,
  accessToken: PropTypes.string.isRequired,
  onSentenceClick: PropTypes.func.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default Transcript;
