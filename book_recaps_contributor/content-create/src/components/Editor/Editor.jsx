import React, { useState } from 'react';
import "../Editor/Editor.scss";
import PublishModal from './PublishModal';

const Editor = () => {
  const [content, setContent] = useState([{ type: 'text', value: '' }]);
  const [bannerImage, setBannerImage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addContentBlock = (type) => {
    setContent([...content, { type, value: '' }]);
  };

  const handleContentChange = (index, value) => {
    const newContent = [...content];
    newContent[index].value = value;
    setContent(newContent);
  };

  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const newContent = [...content];
      newContent[index].value = reader.result;
      setContent(newContent);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleAddBlock = (type) => {
    addContentBlock(type);
    setShowDropdown(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <button className="publish-button" onClick={toggleModal}>Publish</button>
        <button className="save-draft-button">Save Draft</button>
      </div>

      <div className="editor-banner">
        <input
          type="file"
          className="banner-upload"
          id="banner-upload"
          onChange={handleBannerUpload}
          style={{ display: 'none' }}
        />
        <div
          className="banner-placeholder"
          onClick={() => document.getElementById('banner-upload').click()}
          style={{ cursor: 'pointer' }}
        >
          Blog Banner
        </div>
        {bannerImage && (
          <img
            src={bannerImage}
            alt="Blog Banner"
            className="uploaded-banner-image"
          />
        )}
      </div>

      <input type="text" className="editor-title" placeholder="Blog Title" />

      <div className="editor-content">
        {content.map((block, index) => (
          <div key={index} className="content-block">
            {block.type === 'text' && (
              <textarea
                className="text-block"
                placeholder="Write an awesome story..."
                value={block.value}
                onChange={(e) => handleContentChange(index, e.target.value)}
              />
            )}
            {block.type === 'list' && (
              <textarea
                className="list-block"
                placeholder="List item 1\nList item 2\nList item 3"
                value={block.value}
                onChange={(e) => handleContentChange(index, e.target.value)}
              />
            )}
            {block.type === 'image' && (
              <>
                <input
                  type="file"
                  className="image-upload"
                  onChange={(e) => handleImageUpload(index, e)}
                />
                {block.value && (
                  <img
                    src={block.value}
                    alt="Uploaded"
                    className="uploaded-image"
                  />
                )}
              </>
            )}
            {/* Add more block types like heading, quote here */}
          </div>
        ))}

        {/* "+" Button and Dropdown */}
        <div className="add-block-wrapper">
          <button onClick={toggleDropdown} className="add-block-button">
            +
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => handleAddBlock('text')}>Text</button>
              <button onClick={() => handleAddBlock('list')}>List</button>
              <button onClick={() => handleAddBlock('image')}>Image</button>
              <button onClick={() => handleAddBlock('heading')}>Heading</button>
              <button onClick={() => handleAddBlock('quote')}>Quote</button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <PublishModal isOpen={isModalOpen} onClose={toggleModal} />
    </div>
  );
};

export default Editor;
