import React, { useState } from 'react';
import '../DetailBook/Detail.scss';

const Detail = () => {
  const [isDraftStatusVisible, setDraftStatusVisible] = useState(false);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [textUIList, setTextUIList] = useState([]); // Manage multiple Text UI forms

  // Function to add a new text UI form to the list
  const addTextUI = () => {
    setTextUIList([...textUIList, {}]);
  };

  return (
    <div className="detail-container">
      {/* Header Section */}
      <div className="detail-header">
        <img
          src="https://uploads.vw-mms.de/system/production/images/vwn/030/145/images/7a0d84d3b718c9a621100e43e581278433114c82/DB2019AL01950_web_1600.jpg?1649155356"
          alt="Logo"
          className="studio-logo"
        />
        <button className="feedback-button">Send feedback</button>
        <button className="exit-button">Exit Studio</button>
        <div className="avatar">
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="avatar-image"
          />
        </div>
      </div>

      {/* Book Detail Section */}
      <div className="book-detail">
        <div className="book-image">
          <img
            src="https://books.google.com/books/content?id=d3ml6PHJD-sC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
            alt="Book Cover"
            className="book-cover"
          />
        </div>
        <div className="book-meta">
          <h1 className="book-title">Love ‘Em or Lose ‘Em, Sixth Edition</h1>
          <p className="book-authors">Beverly Kaye, Sharon Jordan-Evans</p>
          <div className="publish-container">
            <button
              className="publish-button"
              onMouseEnter={() => setDraftStatusVisible(true)}
              onMouseLeave={() => setDraftStatusVisible(false)}
            >
              PUBLISH
            </button>
            <button
              className="options-button"
              onClick={() => setMenuVisible(!isMenuVisible)}
            >
              ⋮
            </button>

            {isDraftStatusVisible && (
              <div className="draft-status">
                <h3>Draft Status</h3>
                <p><span className="checkmark">✔</span> Title added</p>
                <p><span className="checkmark">✔</span> Image added</p>
                <p><span className="checkmark">✔</span> Context added</p>
                <p><span className="cross">✘</span> No ideas added</p>
                <p><span className="empty">✔</span> No empty ideas</p>
              </div>
            )}

            {isMenuVisible && (
              <div className="options-menu">
                <div className="menu-item">
                  <i className="icon-info"></i> Hide Errors
                </div>
                <div className="menu-item">
                  <i className="icon-link"></i> Visit Original
                </div>
                <div className="menu-item delete-item">
                  <i className="icon-delete"></i> Delete post
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context Section */}
      <div className="context-section">
        <textarea
          className="context-textarea"
          placeholder="Add a context for this post..."
        ></textarea>
      </div>

      {/* Render Text UI Sections */}
      {textUIList.map((_, index) => (
        <div className="text-ui-section" key={index}>
          <div className="add-image-container">
            <i className="fas fa-image"></i> Add Image
          </div>
          <input
            type="text"
            className="idea-title"
            placeholder="Title of the idea"
          />
          <textarea
            className="idea-description"
            placeholder="What inspiring idea do you want to share with the world today?"
          ></textarea>
          <div className="character-count">600</div>
        </div>
      ))}

      {/* Context Buttons - Always at the Bottom */}
      <div className="context-buttons">
        <button
          className="context-button"
          onClick={addTextUI}
        >
          <i className="fas fa-align-left"></i> Text
        </button>
        <button className="context-button">
          <i className="fas fa-quote-left"></i> Quote
        </button>
        <button className="context-button">
          <i className="fas fa-image"></i> Image
        </button>
      </div>
    </div>
  );
};

export default Detail;
