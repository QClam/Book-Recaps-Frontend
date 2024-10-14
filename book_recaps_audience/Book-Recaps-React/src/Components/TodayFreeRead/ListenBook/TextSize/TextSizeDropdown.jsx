import React from 'react';
import '../TextSize/TextSizeDropdown.scss';

const TextSizeDropdown = ({ onTextSizeChange, onBgColorChange }) => {
  const [textSize, setTextSize] = React.useState('medium');
  const [bgColor, setBgColor] = React.useState('#FFFFFF');

  const handleTextSizeChange = (size) => {
    setTextSize(size);
    onTextSizeChange(size); // Notify parent about text size change
  };

  const handleBgColorChange = (color) => {
    setBgColor(color);
    onBgColorChange(color); // Notify parent about background color change
  };

  const resetToDefault = () => {
    handleTextSizeChange('medium');
    handleBgColorChange('#FFFFFF');
  };

  return (
    <div className="text-size-dropdown">
      <div className="dropdown-header">
        <span>Aa</span>
        <span>Text Settings</span>
      </div>
      <div className="text-size-options">
        <div
          className={`text-size-option ${textSize === 'small' ? 'selected' : ''}`}
          onClick={() => handleTextSizeChange('small')}
        >
          Aa
        </div>
        <div
          className={`text-size-option ${textSize === 'medium' ? 'selected' : ''}`}
          onClick={() => handleTextSizeChange('medium')}
        >
          Aa
        </div>
        <div
          className={`text-size-option ${textSize === 'large' ? 'selected' : ''}`}
          onClick={() => handleTextSizeChange('large')}
        >
          Aa
        </div>
      </div>
      <div className="bg-color-options">
        <div
          className={`bg-color-option ${bgColor === '#FFFFFF' ? 'selected' : ''}`}
          onClick={() => handleBgColorChange('#FFFFFF')}
          style={{ backgroundColor: '#FFFFFF' }}
        ></div>
        <div
          className={`bg-color-option ${bgColor === '#FFF4E1' ? 'selected' : ''}`}
          onClick={() => handleBgColorChange('#FFF4E1')}
          style={{ backgroundColor: '#FFF4E1' }}
        ></div>
        <div
          className={`bg-color-option ${bgColor === '#002B36' ? 'selected' : ''}`}
          onClick={() => handleBgColorChange('#002B36')}
          style={{ backgroundColor: '#002B36' }}
        ></div>
      </div>
      <div className="reset-default" onClick={resetToDefault}>
        Reset to default
      </div>
    </div>
  );
};

export default TextSizeDropdown;
