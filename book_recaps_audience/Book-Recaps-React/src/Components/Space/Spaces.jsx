import React from 'react';
import '../Space/Space.scss'; 
import libraryImage from '../../image/library.jpg'; // Import the image

const Spaces = () => {
  return (
    <div className="spaces-container">
      <div className="spaces-content">
        <div className="spaces-text">
          <h1>Introducing free shared Spaces!</h1>
          <p>
            Bring everyone together to enjoy Blinkist recommendations, for free! 
            (Yes, even if they're not yet Blinkist members!)
          </p>
          <a href="#" className="learn-more">Learn more</a>
        </div>
        <div className="spaces-image">
          <img src={libraryImage} alt="People in a meeting" />
        </div>
      </div>
      <div className="spaces-footer">
        <h2>Go to the app and connect to curious minds</h2>
        <p>
          Unfortunately, Spaces is currently only available on the Blinkist mobile app. 
          Download the app now to enjoy sharing your favorite Blinks!
        </p>
      </div>
    </div>
  );
};

export default Spaces;
