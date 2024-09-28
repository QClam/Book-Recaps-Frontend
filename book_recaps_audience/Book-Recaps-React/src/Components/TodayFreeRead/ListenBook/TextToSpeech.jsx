import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeDown, FaUndoAlt, FaRedoAlt } from 'react-icons/fa';
//import "../component/TextToSpeech.css";

const TextToSpeechWithHighlighting = () => {
  const sampleText = `
    Young đang đứng trên cầu thang kính tại cửa hàng 24 giờ mới của Apple ở Đại lộ Fifth, chào đón các ngôi sao trong đêm khai trương. 
    Là một giám đốc cấp cao trong nhiều năm, cô đã quen với việc là người phụ nữ da đen duy nhất trong nhiều cuộc họp. Nhưng khi diễn viên hài Dave tiếp cận cô vào buổi tối hôm đó, mọi thứ đã thay đổi.

    Với ánh mắt thấu hiểu và vài bình luận được chọn lọc kỹ lưỡng, anh đã công nhận những thách thức độc đáo mà cô phải đối mặt với tư cách là một người phụ nữ da đen trong vị trí lãnh đạo điều hành. `;

  const [highlightedText, setHighlightedText] = useState(sampleText);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pausedIndex, setPausedIndex] = useState(0);
  const utteranceRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Estimate duration based on text length and rate
    const estimatedDuration = sampleText.length / rate / 5; // Simple estimation
    setDuration(estimatedDuration);
  }, [sampleText, rate]);

  const handlePlay = (startIndex = pausedIndex) => {
    if (isPaused) {
      // Resume if paused
      speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
    } else if ('speechSynthesis' in window) {
      // Start from pausedIndex or specific start index
      const newText = sampleText.slice(startIndex);
      const utterance = new SpeechSynthesisUtterance(newText);
      utteranceRef.current = utterance;

      const voices = window.speechSynthesis.getVoices();
      const vietnameseVoice = voices.find(voice => voice.lang === 'vi-VN');
      if (vietnameseVoice) {
        utterance.voice = vietnameseVoice;
      }

      utterance.volume = volume;
      utterance.rate = rate;

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const wordIndex = startIndex + event.charIndex;
          const currentWord = sampleText.slice(wordIndex).split(' ')[0];
          const before = sampleText.slice(0, wordIndex);
          const after = sampleText.slice(wordIndex + currentWord.length);

          setHighlightedText(`${before} <mark>${currentWord}</mark> ${after}`);
        }
      };

      utterance.onend = () => {
        setHighlightedText(sampleText);
        setIsPlaying(false);
        setCurrentTime(duration);
        setPausedIndex(0);
        clearInterval(intervalRef.current); // Clear the interval when speech ends
      };

      utterance.onpause = () => {
        setPausedIndex(pausedIndex + utteranceRef.current.charIndex);
        clearInterval(intervalRef.current);
      };

      speechSynthesis.speak(utterance);
      setIsPlaying(true);

      // Update progress every 100 ms
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
    }
  };

  const handlePause = () => {
    speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true); // Set paused status to true
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setHighlightedText(sampleText);
    setIsPlaying(false);
    setIsPaused(false); // Reset paused status
    setCurrentTime(0); // Reset current time on stop
    setPausedIndex(0);
    clearInterval(intervalRef.current); // Clear the interval
  };

  const handleMouseUp = (event) => {
    if (event.detail === 2) { // Check for double-click
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (selectedText) {
        const startIndex = sampleText.indexOf(selectedText);

        if (startIndex !== -1) {
          handleStop(); // Stop the current speech
          setPausedIndex(startIndex);
          handlePlay(startIndex); // Start from the selected position
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
    const newTime = event.target.value;
    setCurrentTime(newTime);
    if (isPlaying) {
      // Implement seeking functionality
      handleStop();
      handlePlay(currentTime);
    }
  };

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      clearInterval(intervalRef.current); // Clear the interval on component unmount
    };
  }, []);

  return (
    <div className="text-container">
      <h1>Chuyển Văn Bản Thành Giọng Nói Với Highlight</h1>
      <div
        dangerouslySetInnerHTML={{ __html: highlightedText }}
        onMouseUp={handleMouseUp} // Add the event handler here
        style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}
      />
      <div className="audio-player">
        <button onClick={isPlaying ? handlePause : () => handlePlay()} className="play-pause-btn">
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <div className="seek-controls">
          <span>15</span>
          <button className="seek-backward" onClick={() => setCurrentTime(prev => Math.max(0, prev - 15))}><FaUndoAlt /></button>
          <button className="seek-forward" onClick={() => setCurrentTime(prev => Math.min(duration, prev + 15))}><FaRedoAlt /></button>
          <span>15</span>
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
  );
};

export default TextToSpeechWithHighlighting;
