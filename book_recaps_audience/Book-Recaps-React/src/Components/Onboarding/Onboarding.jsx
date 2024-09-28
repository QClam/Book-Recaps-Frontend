import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faBrain, faDumbbell, faHeadset, faRocket, faLaptop } from '@fortawesome/free-solid-svg-icons'; // Example icons
import './Onboarding.scss';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    topics: [],
    format: '',
  });

  const navigate = useNavigate();

  const topics = [
    { name: 'Personal Development', icon: faBrain },
    { name: 'Business', icon: faLaptop },
    { name: 'Science', icon: faRocket },
    { name: 'Health & Fitness', icon: faDumbbell },
    { name: 'Technology', icon: faLaptop },
    { name: 'History', icon: faBook },
  ];

  const formats = [
    { name: 'Reading', icon: faBook },
    { name: 'Listening', icon: faHeadset },
    { name: 'Both', icon: faBook },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log(preferences);
      onComplete();
      navigate("/for-you");
    }
  };

  const handleTopicSelection = (topicName) => {
    setPreferences((prevState) => {
      const updatedTopics = prevState.topics.includes(topicName)
        ? prevState.topics.filter((t) => t !== topicName)
        : [...prevState.topics, topicName];
      return { ...prevState, topics: updatedTopics };
    });
  };

  const handleFormatSelection = (formatName) => {
    setPreferences((prevState) => ({ ...prevState, format: formatName }));
  };

  return (
    <div className="onboarding-container">
      {step === 1 && (
        <div className="step">
          <h2>Select your favorite topics</h2>
          <div className="options">
            {topics.map(({ name, icon }) => (
              <button
                key={name}
                onClick={() => handleTopicSelection(name)}
                className={`topic-button ${preferences.topics.includes(name) ? 'selected' : ''}`}
              >
                <FontAwesomeIcon icon={icon} className="icon" />
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step">
          <h2>How do you prefer to consume content?</h2>
          <div className="options">
            {formats.map(({ name, icon }) => (
              <button
                key={name}
                onClick={() => handleFormatSelection(name)}
                className={`format-button ${preferences.format === name ? 'selected' : ''}`}
              >
                <FontAwesomeIcon icon={icon} className="icon" />
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step">
          <h2>You're all set!</h2>
          <p>We will tailor your experience based on your preferences.</p>
          <p>Topics: {preferences.topics.join(', ')}</p>
          <p>Format: {preferences.format}</p>
        </div>
      )}

      <button className="next-button" onClick={handleNext}>
        {step < 3 ? 'Next' : 'Finish'}
      </button>

      <button onClick={() => navigate('/')}>Go to ForYou</button>
    </div>
  );
};

export default Onboarding;
