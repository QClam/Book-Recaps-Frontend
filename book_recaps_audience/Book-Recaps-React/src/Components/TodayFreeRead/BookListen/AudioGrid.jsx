import React, { useEffect, useRef, useState } from "react";
import readAlongData from "../../../data/read_along_output-final.json";
import audioFile from "../../../data/output.mp3";
import BookImage from "../../../image/library.jpg";
import { FaSyncAlt } from "react-icons/fa";
import "../BookListen/AudioGrid.scss";


const AudioGrid = () => {
  const audioRef = useRef(null);
  const transcriptRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState(null);
  const [customMenu, setCustomMenu] = useState({ visible: false, x: 0, y: 0, sectionIndex: null, wordIndex: null });
  const [isLooping, setIsLooping] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(null);
  const [scrollTimeout, setScrollTimeout] = useState(null);
  const [userScrolled, setUserScrolled] = useState(false); // To track user scroll state
  const [manuallyHighlightedWords, setManuallyHighlightedWords] = useState([]);


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
            setCurrentSectionIndex(sectionIndex);
            found = true;
          }
        });
      }
    });

    if (!found) {
      setHighlightedWordIndex(null);
      setCurrentSectionIndex(null);
    }
  }, [currentTime]);

  useEffect(() => {
    if (currentSectionIndex !== null && transcriptRef.current) {
      const section = transcriptRef.current.querySelector(`.transcript-part:nth-of-type(${currentSectionIndex + 1})`);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentSectionIndex]);

  // Handle user scroll to prevent moving away from current section
  useEffect(() => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    const timeout = setTimeout(() => {
      if (currentSectionIndex !== null && transcriptRef.current) {
        const section = transcriptRef.current.querySelector(`.transcript-part:nth-of-type(${currentSectionIndex + 1})`);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          const scrollTop = transcriptRef.current.scrollTop;
          const scrollBottom = scrollTop + transcriptRef.current.clientHeight;

          if (scrollTop > sectionBottom || scrollBottom < sectionTop) {
            transcriptRef.current.scrollTo({ top: sectionTop, behavior: "smooth" });
          }
        }
      }
    }, 100); // Adjust the timeout as needed

    setScrollTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [currentSectionIndex, scrollTimeout]);

  // Prevent scrolling to sections that have not started yet
  useEffect(() => {
    const handleScroll = () => {
      if (transcriptRef.current && currentSectionIndex !== null) {
        const section = transcriptRef.current.querySelector(`.transcript-part:nth-of-type(${currentSectionIndex + 1})`);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          const scrollTop = transcriptRef.current.scrollTop;
          const scrollBottom = scrollTop + transcriptRef.current.clientHeight;

          // Prevent scrolling past sections that haven't started yet
          if (scrollTop <= sectionTop || scrollBottom > sectionBottom) {
            transcriptRef.current.scrollTo({ top: sectionTop, behavior: "smooth" });
          }
        }
      }
    };

    transcriptRef.current.addEventListener("scroll", handleScroll);

    return () => transcriptRef.current.removeEventListener("scroll", handleScroll);
  }, [currentSectionIndex]);

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

  // const handleHighlight = () => {
  //   const { sectionIndex, wordIndex } = customMenu;
  //   const wordElement = document.getElementById(`word-${sectionIndex}-${wordIndex}`);

  //   if (wordElement) {
  //     wordElement.style.backgroundColor = "yellow";
  //     wordElement.style.color = "black";
  //   }
  //   setCustomMenu({ visible: false, x: 0, y: 0, wordIndex: null });
  // };

  const handleHighlight = () => {
    const { sectionIndex, wordIndex } = customMenu;
  
    // Add the highlighted word to the list of manually highlighted words
    setManuallyHighlightedWords((prev) => [...prev, { sectionIndex, wordIndex }]);
  
    const wordElement = document.getElementById(`word-${sectionIndex}-${wordIndex}`);
  
    if (wordElement) {
      wordElement.style.backgroundColor = "yellow";
      wordElement.style.color = "black";
    }
    setCustomMenu({ visible: false, x: 0, y: 0, wordIndex: null });
  };
  

  useEffect(() => {
    const handleClickOutside = () => setCustomMenu({ visible: false, x: 0, y: 0, sectionIndex: null, wordIndex: null });
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  const convertTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle user scroll event
  const handleScroll = () => {
    setUserScrolled(true);
  };

  // Reset scroll state when audio pauses or ends
  const handleAudioPause = () => {
    setUserScrolled(false);
  };

  

  return (
    <div className="audio-grid-wrapper">
      <div className="header-section">
        <img src={BookImage} alt="The Wicked Deep" className="book-cover" />
        <div className="title-section">
          <h2>The Wicked Deep</h2>
          <h3>Shea Ernshaw</h3>
        </div>
      </div>

      <div className="transcript-area" ref={transcriptRef} onScroll={handleScroll}>
        {readAlongData.transcriptSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`transcript-part ${currentSectionIndex === sectionIndex ? "active" : ""}`}
          >
            <h3 onClick={() => handleTranscriptClick(section.start)} className="section-start-time">
              (Start: {convertTime(section.start)})
            </h3>
            {section.transcriptSentences.map((sentence, index) => (
              <span
                key={index}
                id={`word-${sectionIndex}-${index}`}
                className={`transcript-word ${
                  highlightedWordIndex &&
                  highlightedWordIndex.sectionIndex === sectionIndex &&
                  highlightedWordIndex.sentenceIndex === index
                    ? "highlighted-word"
                    : ""
                }`}
                onClick={() => handleTranscriptClick(sentence.start)}
                onContextMenu={(e) => handleRightClick(e, sectionIndex, index)}
              >
                {sentence.value.html + " "}
              </span>
            ))}
          </div>
        ))}
      </div>

      {customMenu.visible && (
        <div
          className="context-menu"
          style={{ top: customMenu.y, left: customMenu.x, position: "fixed", zIndex: 10, display: "flex" }}
        >
          <button onClick={handleHighlight}> <span className="icon">🖍</span> Highlight</button>
          <button onClick={handleCopy}> <span className="icon">📋</span> Copy </button>
        </div>
      )}

      <div className="controls-section">
        <button onClick={toggleLoop} className="loop-toggle">
          <FaSyncAlt color={isLooping ? "white" : "gray"} size={19} />
        </button>
        <audio ref={audioRef} controls className="audio-player" loop={isLooping} onPause={handleAudioPause} onEnded={handleAudioPause}>
          <source src={audioFile} type="audio/mp4" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </div>
  );
};

export default AudioGrid;
