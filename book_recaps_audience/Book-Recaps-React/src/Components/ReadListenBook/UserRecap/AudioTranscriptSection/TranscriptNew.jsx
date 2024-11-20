// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import './Transcript.scss';
// import PropTypes from 'prop-types';
// import Modal from 'react-modal';

// Modal.setAppElement('#root');

// const Transcript = ({ transcriptUrl, accessToken, onSentenceClick, currentTime, userId, recapVersionId, isGenAudio }) => {
//   const [transcriptContent, setTranscriptContent] = useState(null);
//   const [transcriptError, setTranscriptError] = useState(null);
//   const [activeSentence, setActiveSentence] = useState(null);
//   const [contextMenu, setContextMenu] = useState({
//     visible: false,
//     x: 0,
//     y: 0,
//     selectedText: '',
//     sectionIndex: null,
//     sentenceIndex: null,
//   });
//   const [highlightedSentences, setHighlightedSentences] = useState([]);
//   const [notes, setNotes] = useState({});
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentNote, setCurrentNote] = useState("");
//   const [currentSentenceId, setCurrentSentenceId] = useState(null);

//   const sentenceRefs = useRef({});
//   const contextMenuRef = useRef(null);

//   useEffect(() => {
//     const fetchTranscript = async () => {
//       try {
//         const response = await axios.get(transcriptUrl, {
//           headers: {
//             'Authorization': `Bearer ${accessToken}`,
//             'Content-Type': 'application/json',
//           },
//         });
//         const data = response.data;

//         data.transcriptSections.forEach(section => {
//           section.transcriptSentences.forEach(sentence => {
//             sentence.start = parseFloat(sentence.start);
//             sentence.end = parseFloat(sentence.end);
//           });
//         });

//         setTranscriptContent(data);
//       } catch (error) {
//         setTranscriptError('Error fetching transcript data');
//         console.error('Error fetching transcript data:', error);
//       }
//     };

//     fetchTranscript();
//   }, [transcriptUrl, accessToken]);

//   useEffect(() => {
//     if (!isGenAudio) {
//       setActiveSentence(null);
//       return;
//     }

//     if (transcriptContent) {
//       let found = false;
//       for (let section of transcriptContent.transcriptSections) {
//         for (let sentence of section.transcriptSentences) {
//           if (isFinite(sentence.start) && isFinite(sentence.end)) {
//             if (currentTime >= sentence.start && currentTime <= sentence.end) {
//               setActiveSentence(sentence.sentence_index);
//               found = true;
//               break;
//             }
//           }
//         }
//         if (found) break;
//       }

//       if (!found) {
//         setActiveSentence(null);
//       }
//     }
//   }, [currentTime, transcriptContent, isGenAudio]);

//   const handleContextMenu = (event, sectionIndex, sentenceIndex) => {
//     event.preventDefault();
//     const selectedText = event.target.textContent;
//     setContextMenu({
//       visible: true,
//       x: event.pageX,
//       y: event.pageY,
//       selectedText,
//       sectionIndex,
//       sentenceIndex,
//     });
//   };

//   const renderTranscript = () => {
//     return transcriptContent.transcriptSections.map((section, sectionIndex) => (
//       <div key={sectionIndex} className="transcript-section">
//         {section.transcriptSentences.map((sentence, sentenceIndex) => (
//           <span
//             key={sentenceIndex}
//             ref={(el) => (sentenceRefs.current[`sentence-${sectionIndex}-${sentenceIndex}`] = el)}
//             id={`sentence-${sectionIndex}-${sentenceIndex}`}
//             className={`transcript-sentence ${
//               activeSentence === sentence.sentence_index ? 'active' : ''
//             }`}
//             onContextMenu={(e) => handleContextMenu(e, sectionIndex, sentenceIndex)}
//           >
//             {sentence.text} 
//           </span>
//         ))}
//       </div>
//     ));
//   };

//   return (
//     <div className="transcript">
//       {transcriptError ? (
//         <p>{transcriptError}</p>
//       ) : (
//         <div className="transcript-content">
//           {transcriptContent && renderTranscript()}
//         </div>
//       )}
//       {/* Context Menu */}
//       {contextMenu.visible && (
//         <div
//           ref={contextMenuRef}
//           className="context-menu"
//           style={{ top: contextMenu.y, left: contextMenu.x }}
//         >
//           <button onClick={handleCopy}>Copy</button>
//           <button onClick={handleTakeNote}>Take Note</button>
//           <button onClick={handleHighlight}>Highlight</button>
//         </div>
//       )}
//       {/* Note Modal */}
//       <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} contentLabel="Take Note">
//         <h2>Take Note</h2>
//         <textarea
//           value={currentNote}
//           onChange={(e) => setCurrentNote(e.target.value)}
//         />
//         <button onClick={saveNote}>Save Note</button>
//         <button onClick={() => setIsModalOpen(false)}>Close</button>
//       </Modal>
//     </div>
//   );
// };

// export default Transcript;
