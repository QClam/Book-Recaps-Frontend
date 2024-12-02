import React, { useEffect, useRef, useState } from "react"; 
import axios from "axios";
import { FaSyncAlt } from "react-icons/fa";
import "../ListenPart/ListenPart.scss";

const ListenPart = () => {
  const [audioURL, setAudioURL] = useState("");
  const [transcriptData, setTranscriptData] = useState(null);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    selectedText: "",
    sectionIndex: null,
    sentenceIndex: null,
  });
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const [textSize, setTextSize] = useState("18px");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#000000");
  const audioRef = useRef(null);
  const transcriptRef = useRef(null);
  const [highlightedSegment, setHighlightedSegment] = useState({ sectionIndex: null, sentenceIndex: null });
  const [isLooping, setIsLooping] = useState(false);

  // Token Refresh Handler
  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://bookrecaps.cloud/api/tokens/refresh", {
        refreshToken,
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      return newAccessToken;
    } catch (error) {
      setError("Session expired. Please log in again.");
  
      return null;
    }
  };

  // Fetch Recaps
  const fetchRecaps = async () => {
    try {
      const response = await axios.get("https://bookrecaps.cloud/api/recap/get-all-recapsbycontributorId", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.succeeded && response.data.data && response.data.data.$values.length > 0) {
        const recap = response.data.data.$values[0];
        setAudioURL(recap.audioURL);
        setTranscriptData(null);
        fetchTranscriptData(recap.transcriptUrl);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        const newAccessToken = await handleTokenRefresh();
        if (newAccessToken) {
          fetchRecaps();
        }
      } else {
        setError(`Error fetching recaps: ${err.message}`);
      }
    }
  };

  // Fetch Transcript Data
  const fetchTranscriptData = async (transcriptUrl) => {
    try {
      const response = await axios.get(transcriptUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.transcriptSections) {
        const transcriptSections = response.data.transcriptSections;
        setTranscriptData(transcriptSections);
      } else {
        setError("Transcript data not found.");
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        const newAccessToken = await handleTokenRefresh();
        if (newAccessToken) {
          fetchTranscriptData(transcriptUrl);
        }
      } else {
        setError(`Error fetching transcript: ${err.message}`);
      }
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchRecaps();
  }, []);

  // Update CSS Variables
  useEffect(() => {
    document.documentElement.style.setProperty("--bg-color", bgColor);
    document.documentElement.style.setProperty("--text-color", textColor);
  }, [bgColor, textColor]);

  // Audio Time Update Handler
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleAudioEnded = () => {
      if (isLooping) {
        audio.currentTime = 0;
        audio.play();
      }
    };

    if (audio) {
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleAudioEnded);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleAudioEnded);
      }
    };
  }, [isLooping]);

  // Highlight Current Segment Based on Audio Time
  useEffect(() => {
    if (!transcriptData) return;

    let found = false;

    transcriptData.forEach((section, sectionIndex) => {
      if (!found) {
        section.transcriptSentences.forEach((sentence, sentenceIndex) => {
          if (currentTime >= sentence.start && currentTime <= sentence.end) {
            setHighlightedSegment({ sectionIndex, sentenceIndex });
            found = true;

            // Scroll into view
            const sentenceElement = document.getElementById(`sentence-${sectionIndex}-${sentenceIndex}`);
            if (sentenceElement && transcriptRef.current) {
              const { top } = sentenceElement.getBoundingClientRect();
              const { height } = transcriptRef.current.getBoundingClientRect();
              if (top < 0 || top > height) {
                sentenceElement.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }
          }
        });
      }
    });

    if (!found) {
      setHighlightedSegment({ sectionIndex: null, sentenceIndex: null });
    }
  }, [currentTime, transcriptData]);

  // Helper Function to Wrap Sentences in Spans with Unique IDs
  const wrapSentencesInSpans = (html, sectionIndex, sentenceIndex) => {
    // Use a DOM parser to handle existing HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    let sentenceHTML = "";

    while ((node = walker.nextNode())) {
      const sentenceSpan = `<span id="sentence-${sectionIndex}-${sentenceIndex}" class="transcript-sentence">${node.nodeValue}</span>`;
      sentenceHTML += sentenceSpan;
    }

    return sentenceHTML;
  };


  // Handle Left-Click on Sentence to Jump Audio
  const handleTranscriptClick = (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      audioRef.current.play();
    }
  };

  // Handle Right-Click to Show Context Menu
  const handleRightClick = (e, sectionIndex, sentenceIndex) => {
    e.preventDefault();

    const sentenceElement = document.getElementById(`sentence-${sectionIndex}-${sentenceIndex}`);

    if (sentenceElement) {
      const rect = sentenceElement.getBoundingClientRect();
      setContextMenu({
        visible: true,
        x: rect.left,
        y: rect.bottom + window.scrollY,
        selectedText: sentenceElement.textContent,
        sectionIndex,
        sentenceIndex,
      });
    }
  };

    // Function to Play Section from Start Time
    const handlePlaySection = (startTime) => {
        if (audioRef.current) {
          audioRef.current.currentTime = startTime;
          audioRef.current.play();
        }
      };

        // Function to Convert Seconds to MM:SS
  const convertTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60); // Get whole minutes
    const seconds = Math.floor(timeInSeconds % 60); // Get remaining seconds
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  // Handle Highlight Entire Sentence
  const handleHighlight = async () => {
    const { sectionIndex, sentenceIndex } = contextMenu;
    const sentenceElement = document.getElementById(`sentence-${sectionIndex}-${sentenceIndex}`);

    if (sentenceElement) {
      const isHighlighted = sentenceElement.classList.contains("highlighted");
      if (isHighlighted) {
        sentenceElement.classList.remove("highlighted");
      } else {
        sentenceElement.classList.add("highlighted");

        // Create highlight object to send to the API
        const highlightData = {
          sectionIndex: sectionIndex,
          sentenceIndex: sentenceIndex,
          text: contextMenu.selectedText,
          start: transcriptData[sectionIndex].transcriptSentences[sentenceIndex].start,
          end: transcriptData[sectionIndex].transcriptSentences[sentenceIndex].end,
        };
        await sendHighlightToAPI(highlightData);
      }
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

    // Toggle Loop Function
    const toggleLoop = () => {
        setIsLooping(!isLooping); // Toggle the loop state
        if (audioRef.current) {
          audioRef.current.loop = !isLooping;
        }
      };
    
  // Send Highlight to API
  const sendHighlightToAPI = async (highlightData) => {
    try {
      await axios.post("https://bookrecaps.cloud/api/highlight", highlightData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Error saving highlight:", err);
    }
  };

  return (     
        <div className="audio-player-sectionon">
          <h2>Transcript:</h2>
          {transcriptData ? (
            <div
              className="transcriptpy"
              ref={transcriptRef}
              style={{
                fontSize:
                  textSize === "small"
                    ? "14px"
                    : textSize === "large"
                    ? "22px"
                    : "18px",
              }}
            >
              {transcriptData.map((section, sectionIndex) => (
                <div key={sectionIndex} className="transcript-sectionon">
                  <h3
                    onClick={() => handlePlaySection(section.start)}
                    className="section-start-timeme"
                    style={{ width: "25%" }}
                  >
                    (Start: {convertTime(section.start)} )
                  </h3>
                  {section.transcriptSentences.map(
                    (sentence, sentenceIndex) => (
                      <span
                        key={sentenceIndex}
                        onClick={() => handleTranscriptClick(sentence.start)}
                        onContextMenu={(e) =>
                          handleRightClick(e, sectionIndex, sentenceIndex)
                        }
                        className={
                          highlightedSegment.sectionIndex === sectionIndex &&
                          highlightedSegment.sentenceIndex === sentenceIndex
                            ? "highlighted"
                            : ""
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <span
                          dangerouslySetInnerHTML={{
                            __html: wrapSentencesInSpans(
                              sentence.value.html,
                              sectionIndex,
                              sentenceIndex
                            ),
                          }}
                        ></span>
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Loading transcript...</p>
          )}
            <button onClick={toggleLoop} className="loop-buttonon">
            <FaSyncAlt color={isLooping ? "grey" : "black"} size={18} />
          </button>
          {audioURL ? (
            <audio
              ref={audioRef}
              controls
              className="audio-playerer"
              loop={isLooping}
            >
              <source src={audioURL} type="audio/wav" />
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <p className="loading-messagege">Loading audio...</p>
          )}
        </div>   
  );
};

export default ListenPart;
