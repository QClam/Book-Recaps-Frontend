import React from 'react';
import { FaChevronLeft, FaChevronRight, FaLightbulb } from 'react-icons/fa';
import '../KeyIdea/KeyIdeasMenu.scss'

const KeyIdeasMenu = ({ chapters, onClose }) => {
  return (
    <div className="key-ideas-menu">
      <div className="key-ideas-header">
        <FaChevronLeft onClick={onClose} />
        <h3>Chapters</h3>
      </div>
      <div className="key-ideas-content">
        {chapters.map((chapter, index) => (
          <div key={index} className="chapter-item">
            {index === 0 ? (
              <div className="intro-item">
                <FaLightbulb />
                <span>{chapter.title}</span>
              </div>
            ) : (
              <>
                <span className="chapter-number">{index}</span>
                <span>{chapter.title}</span>
                <FaChevronRight />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyIdeasMenu;
