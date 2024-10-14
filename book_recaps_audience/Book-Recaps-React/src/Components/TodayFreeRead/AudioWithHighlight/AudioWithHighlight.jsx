import React, { useEffect, useRef, useState } from "react";
import "../AudioWithHighlight/AudioWithHighlight.scss";
import audioFile from "../../../data/audio.mp3";
import transcriptFile from "../../../data/transcript.vtt";

const AudioWithHighlight = () => {
  const audioRef = useRef(null);
  const [cues, setCues] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState(null);
  const [highlightedText, setHighlightedText] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);

  const parseVTT = (data) => {
    const lines = data.split("\n");
    const cuesList = [];
    let cue = {};

    lines.forEach((line) => {
      if (line.includes("-->")) {
        const [start, end] = line.split(" --> ");
        cue.startTime = parseTime(start);
        cue.endTime = parseTime(end);
      } else if (line.trim() === "") {
        if (cue.startTime !== undefined) {
          cuesList.push(cue);
          cue = {};
        }
      } else {
        cue.text = cue.text ? cue.text + " " + line : line;
      }
    });

    if (cue.startTime !== undefined) {
      cuesList.push(cue);
    }

    const chunkSize = Math.ceil(cuesList.length / 5);
    const result = [];
    for (let i = 0; i < cuesList.length; i += chunkSize) {
      result.push(cuesList.slice(i, i + chunkSize));
    }

    return result;
  };

  const parseTime = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":");
    const [sec, milli] = seconds.split(".");
    return (
      parseInt(hours, 10) * 3600 +
      parseInt(minutes, 10) * 60 +
      parseInt(sec, 10) +
      parseInt(milli, 10) / 1000
    );
  };

  useEffect(() => {
    fetch(transcriptFile)
      .then((response) => response.text())
      .then((data) => {
        const parsedCues = parseVTT(data);
        setCues(parsedCues);
      });
  }, []);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current && cues.length > 0) {
        const currentTime = audioRef.current.currentTime;
        const currentCueIndex = cues.flat().findIndex(
          (cue) => currentTime >= cue.startTime && currentTime <= cue.endTime
        );
        if (currentCueIndex !== -1) {
          setHighlightIndex(currentCueIndex);
        }
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [cues]);

  const handleClick = (cueIndex) => {
    if (audioRef.current) {
      audioRef.current.currentTime = cues.flat()[cueIndex].startTime;
      setHighlightIndex(cueIndex);
    }
  };

  const handleContextMenu = (e, word, cueIndex) => {
    e.preventDefault();
    
    setSelectedWord(word);

    const rect = e.target.getBoundingClientRect();
    const contextMenuHeight = 45;
    const contextMenuWidth = 100;

    let posX = e.clientX;
    let posY = e.clientY;

    if (rect.bottom + contextMenuHeight > window.innerHeight) {
      posY = rect.top - contextMenuHeight;
    }

    if (rect.right + contextMenuWidth > window.innerWidth) {
      posX = rect.left - contextMenuWidth + rect.width;
    }

    setContextMenu({
      visible: true,
      text: word,
      x: posX,
      y: posY,
    });
  };

  const handleHighlight = () => {
    if (contextMenu && selectedWord) {
      setHighlightedText((prev) => [...prev, selectedWord]);
      setContextMenu(null);
      setSelectedWord(null);
    }
  };

  const handleCopy = () => {
    if (contextMenu && selectedWord) {
      navigator.clipboard.writeText(selectedWord);
      setContextMenu(null);
      setSelectedWord(null);
    }
  };

  const getHighlightedText = (text) => {
    const words = text.split(" ");
    return words.map((word, index) => (
      <span
        key={index}
        onContextMenu={(e) => handleContextMenu(e, word, index)}
        className={`word ${highlightedText.includes(word) ? "is-highlighted" : ""}`}
      >
        {word + " "}
      </span>
    ));
  };

  return (
    <div style={{ position: "relative" }}>
      <audio controls ref={audioRef} className="audio-player" src={audioFile}></audio>
      <div>
        {cues.map((section, sectionIndex) => (
          <div className="section" key={sectionIndex}>
            {section.map((cue, cueIndex) => (
              <span
                key={cueIndex}
                onClick={() =>
                  handleClick(sectionIndex * cues[0].length + cueIndex)
                }
                className={`cue ${
                  highlightIndex === sectionIndex * cues[0].length + cueIndex
                    ? "highlighted"
                    : ""
                }`}
              >
                {getHighlightedText(cue.text)}
                {" "}
              </span>
            ))}
          </div>
        ))}
      </div>

      {contextMenu && contextMenu.visible && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button onClick={handleHighlight}>Highlight</button>
          <button onClick={handleCopy}>Copy</button>
        </div>
      )}
    </div>
  );
};

export default AudioWithHighlight;
