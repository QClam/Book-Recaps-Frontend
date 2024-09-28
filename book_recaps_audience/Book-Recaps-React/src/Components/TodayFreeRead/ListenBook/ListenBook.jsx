import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaUndoAlt, FaRedoAlt, FaLightbulb, FaTextHeight, FaPen, FaSearch, FaBook } from 'react-icons/fa';
import { FaChevronDown, FaHighlighter, FaBookmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import '../ListenBook/ListenBook.scss'; // Import the CSS file
import KeyIdeasMenu from './KeyIdea/KeyIdeasMenu';
import TextSizeDropdown from './TextSize/TextSizeDropdown';

const ListenBook = () => {
  const location = useLocation();
  const book = location.state?.book;

  const [highlightedText, setHighlightedText] = useState(book.volumeInfo.description || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pausedIndex, setPausedIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
  const utteranceRef = useRef(null);
  const intervalRef = useRef(null);
  const textRef = useRef(null); // Ref to the text container
  const [isKeyIdeasMenuOpen, setIsKeyIdeasMenuOpen] = useState(false); // State to manage the visibility of Key Ideas menu
  const [isTextSizeDropdownOpen, setIsTextSizeDropdownOpen] = useState(false); // State for Text Size Dropdown
  const [textSize, setTextSize] = useState('medium');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  const chapters = [
    { title: "What's in it for me? New hope and practical solutions for preventing Alzheimer's." },
    { title: "What is Alzheimer's, anyway?" },
    { title: "Building a brain-boosting routine." },
    { title: "Moving your body." },
  ];

  useEffect(() => {
    // Estimate duration based on text length and rate
    const estimatedDuration = highlightedText.length / rate / 5; // Simple estimation
    setDuration(estimatedDuration);
  }, [highlightedText, rate]);

  useEffect(() => {
    document.documentElement.style.setProperty('--text-size', textSize);
    document.documentElement.style.setProperty('--bg-color', bgColor);
  }, [textSize, bgColor]);

  const updateProgress = () => {
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 0.1;
        if (newTime >= duration) {
          clearInterval(intervalRef.current);
          return duration;
        }
        return newTime;
      });
    }, 100);
  };

  const toggleKeyIdeasMenu = () => {
    setIsKeyIdeasMenuOpen(!isKeyIdeasMenuOpen);
  };

  const toggleTextSizeDropdown = () => {
    setIsTextSizeDropdownOpen(!isTextSizeDropdownOpen);
  };

  const handlePlay = (startIndex = pausedIndex) => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else if ('speechSynthesis' in window) {
      const newText = highlightedText.slice(startIndex);
      const utterance = new SpeechSynthesisUtterance(newText);
      utteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang === 'en-US');
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.volume = volume;
      utterance.rate = rate;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const wordIndex = startIndex + event.charIndex;
          const currentWord = highlightedText.slice(wordIndex).split(' ')[0];
          const before = highlightedText.slice(0, wordIndex);
          const after = highlightedText.slice(wordIndex + currentWord.length);

          setHighlightedText(`${before} <mark>${currentWord}</mark> ${after}`);
        }
      };

      utterance.onend = () => {
        setHighlightedText(book.volumeInfo.description);
        setIsPlaying(false);
        setCurrentTime(duration);
        setPausedIndex(0);
        clearInterval(intervalRef.current);
      };

      utterance.onpause = () => {
        setPausedIndex(pausedIndex + utteranceRef.current.charIndex);
        clearInterval(intervalRef.current);
      };

      speechSynthesis.speak(utterance);
      setIsPlaying(true);
      updateProgress();
    }
  };

  const handlePause = () => {
    speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
    clearInterval(intervalRef.current);
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setHighlightedText(book.volumeInfo.description);
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
    setPausedIndex(0);
    clearInterval(intervalRef.current);
  };

  const handleMouseUp = (event) => {
    if (event.detail === 2) {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (selectedText) {
        const textContent = textRef.current.textContent;
        const startIndex = textContent.indexOf(selectedText);

        if (startIndex !== -1) {
          handleStop();
          setPausedIndex(startIndex);
          handlePlay(startIndex);
        }
      }
    }
  };

  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
    if (utteranceRef.current) {
      utteranceRef.current.volume = event.target.value;
    }
  };

  const handleRateChange = (event) => {
    setRate(event.target.value);
    if (utteranceRef.current) {
      utteranceRef.current.rate = event.target.value;
    }
  };

  const handleProgressChange = (event) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);

    if (isPlaying) {
      handleStop();
      handlePlay(pausedIndex + Math.floor(newTime * 5)); // Adjust start index based on progress
    }
  };

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      clearInterval(intervalRef.current);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTextSizeChange = (size) => {
    setTextSize(size);
    setIsTextSizeDropdownOpen(false); // Close dropdown after selection
  };

  const handleBgColorChange = (color) => {
    setBgColor(color);
  };

  return (
    <div className="container">
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="toggleButton" onClick={toggleSidebar}>
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </div>
        <div className="menuContainer">
          <div className="menuItem" onClick={toggleKeyIdeasMenu}>
            <FaLightbulb className="menuIcon" />
            {isSidebarOpen && <span>Key ideas</span>}
          </div>

          <div className="menuItem" onClick={toggleTextSizeDropdown}>
            <FaTextHeight className="menuIcon" />
            <span>Text size</span>
            <FaChevronDown />
          </div>
          {isTextSizeDropdownOpen && (
            <div className="textSizeDropdown">
              <div className="text-size-options">
                <div className="text-size-option" onClick={() => handleTextSizeChange('small')}>aA</div>
                <div className="text-size-option" onClick={() => handleTextSizeChange('medium')}>aA</div>
                <div className="text-size-option" onClick={() => handleTextSizeChange('large')}>aA</div>
              </div>

              <div className="themeOption">
                <button className={`bg-color-option ${bgColor === '#ffffff' ? 'selected' : ''}`} style={{ backgroundColor: '#ffffff' }} onClick={() => handleBgColorChange('#ffffff')}></button>
                <button className={`bg-color-option ${bgColor === '#f3ecd8' ? 'selected' : ''}`} style={{ backgroundColor: '#f3ecd8' }} onClick={() => handleBgColorChange('#f3ecd8')}></button>
                <button className={`bg-color-option ${bgColor === '#00171f' ? 'selected' : ''}`} style={{ backgroundColor: '#00171f' }} onClick={() => handleBgColorChange('#00171f')}></button>
              </div>
            </div>
          )}

          <div className="menuItem">
            <FaHighlighter className="menuIcon" />
            {isSidebarOpen && <span>Highlights</span>}
          </div>
          <hr />
          <div className="menuItem">
            <FaSearch className="menuIcon" />
            {isSidebarOpen && <span>Explore</span>}
          </div>
          <div className="menuItem">
            <FaBookmark className="menuIcon" />
            {isSidebarOpen && <span>My Library</span>}
          </div>
        </div>
      </div>

      {/* Book Info Section */}
      <div className="bookInfo">
        <img className="bookImage" src={book.volumeInfo.imageLinks?.thumbnail} alt={book.volumeInfo.title} />
        <div className="bookTitle">{book.volumeInfo.title}</div>
        <div className="bookAuthor">{book.volumeInfo.authors?.join(', ')}</div>
      </div>

      <div className="content">
        <div className="mainContent">
          <h2 className="title">Book Content</h2>
          <div
            dangerouslySetInnerHTML={{ __html: highlightedText }}
            onMouseUp={handleMouseUp}
            className="text-container"
            ref={textRef}
          />
          <div className="audio-player">
            <button onClick={isPlaying ? handlePause : () => handlePlay()} className="play-pause-btn">
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <div className="seek-controls">
              <button className="seek-backward" onClick={() => setCurrentTime(prev => Math.max(0, prev - 15))}><FaUndoAlt /></button>
              <button className="seek-forward" onClick={() => setCurrentTime(prev => Math.min(duration, prev + 15))}><FaRedoAlt /></button>
            </div>
            <span className="current-time">{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
            <input
              type="range"
              className="progress-bar"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleProgressChange}
            />
            <span className="duration">{new Date(duration * 1000).toISOString().substr(14, 5)}</span>
            <FaVolumeDown />
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
            />
            <FaVolumeUp />
            <span className="rate-control">
              {rate.toFixed(1)}x
              <input
                type="range"
                className="rate-slider"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={handleRateChange}
              />
            </span>
          </div>
        </div>
      </div>
      {isKeyIdeasMenuOpen && <KeyIdeasMenu chapters={chapters} onClose={toggleKeyIdeasMenu} />}
    </div>
  );
};

export default ListenBook;
