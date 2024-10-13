import React, { useState, useEffect, useRef } from "react";
import { Editor } from "reactjs-editor";
import readAlongData from "../../../data/read_along_output-final.json";
import audioFile from "../../../data/output.mp3";
import BookImage from "../../../image/library.jpg";
import { FaSyncAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const NoteReadBook = () => {
  const [editorContent, setEditorContent] = useState(`
    <main>
      <div style="border-radius:30px;width:50%;padding:30px; margin:40px auto; box-shadow: rgba(17, 12, 46, 0.15) 0px 48px 100px 0px;">
        <h1 style="color:blue;">Select Text Below and See the Magic</h1>
        <div style="display:flex;">
          <aside>
            <p style="padding:10px;text-align:left;color:#000;line-height:25px;">
              You can select any text and add comments. You can make text bold. You can use any text using color you choose. These are the features of React Editor. You can highlight that React Editor if you want to.
            </p>
          </aside>
          <aside>
            <p style="padding:10px;text-align:left;color:#000;line-height:25px;">
              HTML and CSS are fundamental tools in web development, enabling the creation of visually appealing and structured web pages. Tag in HTML is used to define paragraphs, allowing content to be organized into distinct blocks of text.
            </p>
          </aside>
        </div>
      </div>
    </main>
  `);

  const highlightText = () => {
    document.execCommand("backColor", false, "yellow");
  };

  const boldText = () => {
    document.execCommand("bold", false, null);
  };

  const addNote = () => {
    const note = prompt("Enter your note:");
    if (note) {
      document.execCommand("insertHTML", false, `<span class="note">${note}</span>`);
    }
  };

  const navigate = useNavigate();
  const audioRef = useRef(null);
  const transcriptRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(null);
  const [textSize, setTextSize] = useState('medium');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#000000');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTextSettingsOpen, setIsTextSettingsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [highlightedTexts, setHighlightedTexts] = useState([]);
  const [isLooping, setIsLooping] = useState(false);
  const [customMenu, setCustomMenu] = useState({ visible: false, x: 0, y: 0, wordIndex: null });

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    let found = false;
    readAlongData.transcriptSections.forEach((section, sectionIndex) => {
      if (!found) {
        section.transcriptSentences.forEach((sentence, sentenceIndex) => {
          if (currentTime >= sentence.start && currentTime <= sentence.end) {
            setHighlightedWordIndex({ sectionIndex, sentenceIndex });
            found = true;
          }
        });
      }
    });

    if (!found) {
      setHighlightedWordIndex(null);
    }
  }, [currentTime]);

  const handleTranscriptClick = (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
    }
  };

  const handleRightClick = (e, sectionIndex, wordIndex) => {
    e.preventDefault();
    setCustomMenu({ visible: true, x: e.clientX, y: e.clientY, sectionIndex, wordIndex });
  };

  const handleCopy = () => {
    const { sectionIndex, wordIndex } = customMenu;
    const word = readAlongData.transcriptSections[sectionIndex].transcriptSentences[wordIndex].value.html;
    navigator.clipboard.writeText(word);
    setCustomMenu({ visible: false, x: 0, y: 0, wordIndex: null });
  };

  const handleHighlight = () => {
    const { sectionIndex, wordIndex } = customMenu;
    const wordElement = document.getElementById(`word-${sectionIndex}-${wordIndex}`);

    if (wordElement) {
      wordElement.style.backgroundColor = "yellow";
      wordElement.style.color = "black";
    }
    setCustomMenu({ visible: false, x: 0, y: 0, wordIndex: null });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setCustomMenu({ visible: false, x: 0, y: 0, wordIndex: null });
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);

    let found = false;
    readAlongData.transcriptSections.forEach((section, sectionIndex) => {
      if (!found) {
        section.transcriptSentences.forEach((sentence, sentenceIndex) => {
          if (currentTime >= sentence.start && currentTime <= sentence.end) {
            setHighlightedWordIndex({ sectionIndex, sentenceIndex });
            found = true;

            const highlightedElement = document.querySelector(".highlighted");
            if (highlightedElement && transcriptRef.current) {
              transcriptRef.current.scrollTo({
                top: highlightedElement.offsetTop - transcriptRef.current.offsetTop - 100,
                behavior: "smooth"
              });
            }
          }
        });
      }
    });

    if (!found) setHighlightedWordIndex(null);
  }, [currentTime, bgColor, textColor]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const convertTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="readbook-container">
      <div className="editor-container">
        <div className="toolbar">
          <button onClick={highlightText}>Highlight</button>
          <button onClick={boldText}>Bold</button>
          <button onClick={addNote}>Take Note</button>
        </div>
        <Editor
          htmlContent={editorContent}
          onChange={setEditorContent}
        />
      </div>

      <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
          {isSidebarCollapsed ? "→" : "←"}
        </div>

        <div className="sidebar-content">
          <div className="sidebar-item">
            <span className="icon">💡</span>
            {!isSidebarCollapsed && <span className="label">Chapters</span>}
          </div>
          <div className="sidebar-item" onClick={() => setIsTextSettingsOpen(!isTextSettingsOpen)}>
            <span className="icon">Aa</span>
            {!isSidebarCollapsed && <span className="label">Text Settings</span>}
            <span className="dropdown-icon">{isTextSettingsOpen ? "▼" : "▲"}</span>
          </div>
          {isTextSettingsOpen && (
            <div className="text-settings-dropdown">
              <div className="text-size-options">
                <div onClick={() => setTextSize('small')}>Small</div>
                <div onClick={() => setTextSize('medium')}>Medium</div>
                <div onClick={() => setTextSize('large')}>Large</div>
              </div>
              <div className="color-options">
                <div className="color-swatch" style={{ backgroundColor: '#FFFFFF' }} onClick={() => setBgColor('#FFFFFF')}></div>
                <div className="color-swatch" style={{ backgroundColor: '#f3ecd8' }} onClick={() => setBgColor('#f3ecd8')}></div>
                <div className="color-swatch" style={{ backgroundColor: '#2E3E5C' }} onClick={() => setBgColor('#2E3E5C')}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="book-content">
        <div className="book-info">
          <img src={BookImage} alt="Book" className="book-image" />
          <h2 className="book-title">Book Title</h2>
        </div>

        <div className="transcript" ref={transcriptRef}>
          {readAlongData.transcriptSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.transcriptSentences.map((sentence, sentenceIndex) => (
                <span
                  key={sentenceIndex}
                  id={`word-${sectionIndex}-${sentenceIndex}`}
                  className={highlightedWordIndex && highlightedWordIndex.sectionIndex === sectionIndex && highlightedWordIndex.sentenceIndex === sentenceIndex ? "highlighted" : ""}
                  onClick={() => handleTranscriptClick(sentence.start)}
                  onContextMenu={(e) => handleRightClick(e, sectionIndex, sentenceIndex)}
                >
                  {sentence.value.html}{" "}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="audio-controls">
          <audio ref={audioRef} src={audioFile} controls />
          <button onClick={toggleLoop} className={`loop-button ${isLooping ? "active" : ""}`}>
            <FaSyncAlt />
          </button>
        </div>

        {customMenu.visible && (
          <div
            className="context-menu"
            style={{ top: customMenu.y, left: customMenu.x }}
          >
            <button onClick={handleHighlight}>Highlight</button>
            <button onClick={handleCopy}>Copy</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteReadBook;
