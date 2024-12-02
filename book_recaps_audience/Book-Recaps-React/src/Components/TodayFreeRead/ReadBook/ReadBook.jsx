import React, { useEffect, useRef, useState } from "react";
import readAlongData from "../../../data/read_along_output-final.json";
import audioFile from "../../../data/output.mp3";
import BookImage from "../../../image/library.jpg";
import "./ReadBook.scss";
import { FaSyncAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { routes } from "../../../routes";

const ReadBook = () => {
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
  const [isLooping, setIsLooping] = useState(false); // State to control loop
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
    let found = false; // Track if we have found the word to highlight
    readAlongData.transcriptSections.forEach((section, sectionIndex) => {
      if (!found) { // Only continue if we haven't found the word
        section.transcriptSentences.forEach((sentence, sentenceIndex) => {
          if (currentTime >= sentence.start && currentTime <= sentence.end) {
            setHighlightedWordIndex({ sectionIndex, sentenceIndex }); // Highlight the current word
            found = true; // Stop further processing once found
          }
        });
      }
    });
  
    // Reset the highlight if no word is found (end of sections)
    if (!found) {
      setHighlightedWordIndex(null);
    }
  }, [currentTime]);
  
    // Jump to the clicked word's start time
    const handleTranscriptClick = (startTime) => {
      if (audioRef.current) {
        audioRef.current.currentTime = startTime;
        audioRef.current.play(); // Continue playing after jumping
      }
    };
  
    // Handle right-click to show the custom context menu
    const handleRightClick = (e, sectionIndex, wordIndex) => {
      e.preventDefault(); // Prevent the default browser context menu
      setCustomMenu({ visible: true, x: e.clientX, y: e.clientY, sectionIndex, wordIndex });
    };
  
    // Handle copy to clipboard
    const handleCopy = () => {
      const { sectionIndex, wordIndex } = customMenu;
      const word = readAlongData.transcriptSections[sectionIndex].transcriptSentences[wordIndex].value.html;
      navigator.clipboard.writeText(word);
      setCustomMenu({ visible: false, x: 0, y: 0, wordIndex: null });
    };
  
    // Handle highlighting the word
    const handleHighlight = () => {
      const { sectionIndex, wordIndex } = customMenu;
      const wordElement = document.getElementById(`word-${sectionIndex}-${wordIndex}`);
  
      if (wordElement) {
        wordElement.style.backgroundColor = "yellow"; // Highlight the word
        wordElement.style.color = "black";
      }
      setCustomMenu({ visible: false, x: 0, y: 0, wordIndex: null }); // Hide the context menu
    };
  
    // Hide custom context menu on click outside
    useEffect(() => {
      const handleClickOutside = () => {
        setCustomMenu({ visible: false, x: 0, y: 0, wordIndex: null });
      };
  
      window.addEventListener("click", handleClickOutside);
      return () => {
        window.removeEventListener("click", handleClickOutside);
      };
    }, []);
  
    // Toggle loop function
    const toggleLoop = () => {
      setIsLooping(!isLooping); // Toggle the loop state
      if (audioRef.current) {
        audioRef.current.loop = !isLooping;
      }
    };
  
     // Function to handle playing section from start time
     const handlePlaySection = (startTime) => {
      if (audioRef.current) {
        audioRef.current.currentTime = startTime;
        audioRef.current.play();
      }
    };
  
    // Function to convert seconds to minutes and seconds
 
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

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);

    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleTextSizeChange = (size) => setTextSize(size);
  const handleBgColorChange = (color) => setBgColor(color);
  const handleTextColorChange = (color) => setTextColor(color);

  // Hide custom context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const convertTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60); // Get whole minutes
    const seconds = Math.floor(timeInSeconds % 60); // Get remaining seconds
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  return (
    <div className="readbook-container">
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
              <div className="text-settings-options">
                <div className="text-size-option" onClick={() => handleTextSizeChange('small')}>aA</div>
                <div className="text-size-option" onClick={() => handleTextSizeChange('medium')}>aA</div>
                <div className="text-size-option" onClick={() => handleTextSizeChange('large')}>aA</div>
              </div>
              <div className="color-options">
                <div className="color-swatch" style={{ backgroundColor: '#FFFFFF' }} onClick={() => handleBgColorChange('#FFFFFF')}></div>
                <div className="color-swatch" style={{ backgroundColor: '#f3ecd8' }} onClick={() => handleBgColorChange('#f3ecd8')}></div>
                <div className="color-swatch" style={{ backgroundColor: '#2E8B57' }} onClick={() => handleBgColorChange('#2E8B57')}></div>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
        <div className="sidebar-item" onClick={() => handleNavigation('/for-you')}>
            <span className="icon">🏠</span>
            {!isSidebarCollapsed && <span className="label">For You</span>}
          </div>
          <div className="sidebar-item" onClick={() => handleNavigation(routes.explore)}>
            <span className="icon">🔍</span>
            {!isSidebarCollapsed && <span className="label">Explore</span>}
          </div>
          <div className="sidebar-item" onClick={() => handleNavigation('/highlights')}>
            <span className="icon">🖍</span>
            {!isSidebarCollapsed && <span className="label">Highlight</span>}
          </div>
        </div>
      </div>

      <div className="content">
        <div className="book-header">
          <img src={BookImage} alt="The Wicked Deep" className="book-image" />
          <div className="book-title">
            <h2>The Wicked Deep</h2>
            <h3>Shea Ernshaw</h3>
          </div>
        </div>

        <div
          className="transcriptt"
          ref={transcriptRef}
          style={{ fontSize: textSize === 'small' ? '14px' : textSize === 'large' ? '22px' : '18px' }}
        >
          <div >
          {readAlongData.transcriptSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 onClick={() => handlePlaySection(section.start)} className="section-start-time" style={{width: "25%"}}>(Start: {convertTime(section.start)} )</h3>
            {section.transcriptSentences.map((sentence, index) => (
              <span
                key={index}
                id={`word-${sectionIndex}-${index}`}
                className={
                  highlightedWordIndex &&
                  highlightedWordIndex.sectionIndex === sectionIndex &&
                  highlightedWordIndex.sentenceIndex === index
                    ? "highlighted"
                    : ""
                }
                onClick={() => handleTranscriptClick(sentence.start)}
                onContextMenu={(e) => handleRightClick(e, sectionIndex, index)}
                style={{ cursor: "pointer" }}
              >
                {sentence.value.html + " "}
              </span>
            ))}
          </div>
        ))}
        </div>
        </div>

        {customMenu.visible && (
        <div
          className="custom-menu"
          style={{ top: customMenu.y, left: customMenu.x, position: "fixed", zIndex: 10 }}
        >
          <button onClick={handleHighlight}> <span className="icon">🖍</span> Highlight</button>
          <button onClick={handleCopy}><span className="icon">📋</span> Copy </button>
        </div>
      )}

<div className="audio-play-containerr">
  <div className="audio-controls">
    <button onClick={toggleLoop} className="loop-button">
      <FaSyncAlt color={isLooping ? "white" : "black"} size={18} />
    </button>

    <audio ref={audioRef} controls style={{ width: "90%", marginLeft: 30 }} loop={isLooping}>
      <source src={audioFile} type="audio/mp4" />
      Your browser does not support the audio element.
    </audio>
  </div>
</div>

      </div>
    </div>
  );
};

export default ReadBook;
