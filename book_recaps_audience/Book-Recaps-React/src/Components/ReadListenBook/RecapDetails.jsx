import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./RecapDetails.scss";
import { FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RecapDetails = () => {
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
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTextSettingsOpen, setIsTextSettingsOpen] = useState(false);
  const [textSize, setTextSize] = useState("18px"); // Initialize with default pixel size
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#000000");
  const audioRef = useRef(null);
  const transcriptRef = useRef(null);
  const [highlightedSegment, setHighlightedSegment] = useState({
    sectionIndex: null,
    sentenceIndex: null,
  });
  const [isLooping, setIsLooping] = useState(false); // State to control loop

  // Token Refresh Handler
  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post(
        "https://160.25.80.100:7124/api/tokens/refresh",
        {
          refreshToken,
        }
      );
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      } = response.data.message.token;
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      return newAccessToken;
    } catch (error) {
      setError("Session expired. Please log in again.");
      navigate("/login"); // Redirect to login page
      return null;
    }
  };

  // Fetch Recaps
  const fetchRecaps = async () => {
    try {
      const response = await axios.get(
        "https://160.25.80.100:7124/api/recap/get-all-recapsbycontributorId",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data.succeeded &&
        response.data.data &&
        response.data.data.$values.length > 0
      ) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          if (
            currentTime >= sentence.start &&
            currentTime <= sentence.end
          ) {
            setHighlightedSegment({ sectionIndex, sentenceIndex });
            found = true;

            // Scroll into view
            const sentenceElement = document.getElementById(
              `sentence-${sectionIndex}-${sentenceIndex}`
            );
            if (sentenceElement && transcriptRef.current) {
              const { top } = sentenceElement.getBoundingClientRect();
              const { height } = transcriptRef.current.getBoundingClientRect();
              if (top < 0 || top > height) {
                sentenceElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
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



  const handleBgColorChange = (color) => {
    setBgColor(color);
    if (color === '#2E8B57') {
        setTextColor('#FFFFFF'); // Set text color to white for dark background
    } else {
        setTextColor('#000000'); // Default text color
    }
};

const handleTextColorChange = (color) => setTextColor(color);

const handleTextSizeChange = (size) => {
    let fontSize;
    switch (size) {
        case 'small':
            fontSize = '14px';
            break;
        case 'medium':
            fontSize = '18px';
            break;
        case 'large':
            fontSize = '22px';
            break;
        default:
            fontSize = '18px';
    }
    setTextSize(fontSize);
};

// Save preferences whenever they change
useEffect(() => {
    document.documentElement.style.setProperty('--text-size', textSize);
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);

    localStorage.setItem('textSize', textSize);
    localStorage.setItem('bgColor', bgColor);
    localStorage.setItem('textColor', textColor);
}, [textSize, bgColor, textColor]);


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
    e.preventDefault(); // Prevent the default browser context menu

    const sentenceElement = document.getElementById(
      `sentence-${sectionIndex}-${sentenceIndex}`
    );

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

  // Handle Highlight Entire Sentence
// Handle Highlight Entire Sentence
const handleHighlight = async () => {
  const { sectionIndex, sentenceIndex } = contextMenu;
  const sentenceElement = document.getElementById(
      `sentence-${sectionIndex}-${sentenceIndex}`
  );

  if (sentenceElement) {
      // Toggle highlight
      const isHighlighted = sentenceElement.classList.contains("highlighted");
      if (isHighlighted) {
          sentenceElement.classList.remove("highlighted");
      } else {
          sentenceElement.classList.add("highlighted");

          // Create highlight object to send to the API
          const highlightData = {
              sectionIndex: sectionIndex,
              sentenceIndex: sentenceIndex,
              highlightedText: sentenceElement.textContent, // Get the highlighted text
              timestamp: currentTime, // Optional: include current time if needed
          };

          try {
              await sendHighlightRequest(highlightData);
          } catch (error) {
              console.error("Error saving highlight:", error);
          }
      }
  }

  setContextMenu({ ...contextMenu, visible: false });
};

// Function to send highlight request
const sendHighlightRequest = async (highlightData) => {
  // Get accessToken and refreshToken from localStorage
  let accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  try {
      const response = await axios.post(
          "https://160.25.80.100:7124/api/highlight/createhighlight",
          highlightData,
          {
              headers: {
                  Authorization: `Bearer ${accessToken}`, // Send the token if needed
                  "Content-Type": "application/json",
              },
          }
      );

      // Log response data to console
      console.log("Highlight saved:", response.data);

      // Optionally, handle the response if needed
      if (!response.data.succeeded) {
          console.error("Failed to save highlight:", response.data.message);
      }
  } catch (error) {
      if (error.response && error.response.status === 401) {
          console.log("Access token expired, attempting to refresh...");

          await handleTokenRefresh(refreshToken);
          accessToken = localStorage.getItem("authToken"); // Get the new access token after refresh

          // Retry sending the highlight request
          await sendHighlightRequest(highlightData);
      } else {
          throw error; // Rethrow the error to be handled by the calling function
      }
  }
};


  // Handle Copy Sentence Text
  const handleCopy = () => {
    const { selectedText } = contextMenu;
    navigator.clipboard
      .writeText(selectedText)
      .then(() => {
        alert("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
        alert("Failed to copy text.");
      });
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Hide Context Menu on Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".context-menu") &&
        !event.target.closest(".transcript-sentence")
      ) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  // Toggle Loop Function
  const toggleLoop = () => {
    setIsLooping(!isLooping); // Toggle the loop state
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
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

  // Handle Navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div
      className="recap-container"
      onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
    >
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div
          className="sidebar-toggle"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? "→" : "←"}
        </div>

        <div className="sidebar-content">
          <div className="sidebar-item">
            <span className="icon">💡</span>
            {!isSidebarCollapsed && <span className="label">Chapters</span>}
          </div>
          <div
            className="sidebar-item"
            onClick={() => setIsTextSettingsOpen(!isTextSettingsOpen)}
          >
            <span className="icon">Aa</span>
            {!isSidebarCollapsed && <span className="label">Text Settings</span>}
            <span className="dropdown-icon">
              {isTextSettingsOpen ? "▼" : "▲"}
            </span>
          </div>
          {isTextSettingsOpen && (
            <div className="text-settings-dropdown">
              <div className="text-settings-options">
                <div
                  className={`text-size-option ${
                    textSize === "14px" ? "selected" : ""
                  }`}
                  onClick={() => handleTextSizeChange("small")}
                  style={{ fontSize: "14px" }}
                >
                  aA
                </div>
                <div
                  className={`text-size-option ${
                    textSize === "18px" ? "selected" : ""
                  }`}
                  onClick={() => handleTextSizeChange("medium")}
                  style={{ fontSize: "18px" }}
                >
                  aA
                </div>
                <div
                  className={`text-size-option ${
                    textSize === "22px" ? "selected" : ""
                  }`}
                  onClick={() => handleTextSizeChange("large")}
                  style={{ fontSize: "22px" }}
                >
                  aA
                </div>
              </div>

              <div className="color-options">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: "#FFFFFF" }}
                  onClick={() => handleBgColorChange("#FFFFFF")}
                ></div>
                <div
                  className="color-swatch"
                  style={{ backgroundColor: "#f3ecd8" }}
                  onClick={() => handleBgColorChange("#f3ecd8")}
                ></div>
                <div
                  className="color-swatch"
                  style={{ backgroundColor: "#2E8B57" }}
                  onClick={() => handleBgColorChange("#2E8B57")}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <div
            className="sidebar-item"
            onClick={() => handleNavigation("/for-you")}
          >
            <span className="icon">🏠</span>
            {!isSidebarCollapsed && <span className="label">For You</span>}
          </div>
          <div
            className="sidebar-item"
            onClick={() => handleNavigation("/explore")}
          >
            <span className="icon">🔍</span>
            {!isSidebarCollapsed && <span className="label">Explore</span>}
          </div>
          <div
            className="sidebar-item"
            onClick={() => handleNavigation("/highlights")}
          >
            <span className="icon">🖍</span>
            {!isSidebarCollapsed && <span className="label">Highlight</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="recap-detailsls">
        <div className="audio-player-section">
          <h2>Transcript:</h2>
          {transcriptData ? (
            <div
              className="transcriptt"
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
                <div key={sectionIndex} className="transcript-section">
                  <h3
                    onClick={() => handlePlaySection(section.start)}
                    className="section-start-time"
                    style={{ width: "25%" }}
                  >
                    (Start: {convertTime(section.start)} )
                  </h3>
                  {section.transcriptSentences.map(
                    (sentence, sentenceIndex) => (
                      <p
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
                      </p>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>Loading transcript...</p>
          )}
          {audioURL ? (
            <audio
              ref={audioRef}
              controls
              className="audio-player"
              loop={isLooping}
            >
              <source src={audioURL} type="audio/wav" />
              Your browser does not support the audio tag.
            </audio>
          ) : (
            <p className="loading-message">Loading audio...</p>
          )}
        </div>
      </div>

      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          role="menu"
          aria-label="Context Menu"
        >
          <div onClick={handleHighlight} role="menuitem" tabIndex="0"><span className="icon">🖍</span>
            Highlight
          </div>
          <div onClick={handleCopy} role="menuitem" tabIndex="0"><span className="icon">📋</span>
            Copy
          </div>
        </div>
      )}

      {/* Audio Controls */}
      <div className="audio-play-container">
        <div className="audio-controls">
          
          <button onClick={toggleLoop} className="loop-button">
            <FaSyncAlt color={isLooping ? "grey" : "black"} size={18} />
          </button>

          <audio
            ref={audioRef}
            controls
            style={{ width: "90%", marginLeft: 30 }}
            loop={isLooping}
          >
            <source src={audioURL} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  );
};

export default RecapDetails;
