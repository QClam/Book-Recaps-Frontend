import React, { useState, useEffect } from 'react';  
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faHeadset, faTree, faFlask, faRocket, faBookOpen, faLaptop, faBrain, 
faBusinessTime, faChild, faComments, faDollarSign, faChartLine, faHeart, faUserGraduate, faThumbsDown,    
faChalkboardTeacher, 
faPeopleArrows, 
faBullhorn,      
faClock,      
faChartPie,     
faHeartbeat  } from '@fortawesome/free-solid-svg-icons';
import './Onboarding.scss';
import axios from 'axios';
import { routes } from "../../routes";

const Onboarding = ({ onComplete = () => {} }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    topics: [],
    format: '',
    improvement: null,
    desiredBook: '', // New state for desired book
    authors: [],
  });
  const [bookData, setBookData] = useState([]);
  const [authorData, setAuthorData] = useState([]); 
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const [currentBookIndex, setCurrentBookIndex] = useState(0); 
  const [selectedEmoji, setSelectedEmoji] = useState(null); // Add this state


  const topics = [
    { name: 'Thiên nhiên', icon: faTree },              
    { name: 'Khoa học', icon: faFlask },                 
    { name: 'Khởi nghiệp', icon: faRocket },             
    { name: 'Lịch sử thế giới', icon: faBookOpen },      
    { name: 'Tiểu thuyết', icon: faBookOpen },           
    { name: 'Triết học', icon: faBrain },                
    { name: 'Quản lý doanh nghiệp', icon: faBusinessTime }, 
    { name: 'Nuôi dạy con', icon: faChild },             
    { name: 'Kỹ năng giao tiếp', icon: faComments },     
    { name: 'Đầu tư tài chính', icon: faDollarSign },    
    { name: 'Marketing - Bán hàng', icon: faChartLine }, 
    { name: 'Tâm lý học', icon: faHeart },    
    { name: 'Phát triển bản thân', icon: faUserGraduate }, 
    { name: 'Tư duy lãnh đạo', icon: faChalkboardTeacher }, 
    { name: 'Chính trị', icon: faPeopleArrows },         
    { name: 'Truyền động lực', icon: faBullhorn },        
    { name: 'Tự truyện - Hồi ký', icon: faBook },        
    { name: 'Quản lý thời gian', icon: faClock },         
    { name: 'Kinh tế học', icon: faChartPie },            
    { name: 'Sức khỏe', icon: faHeartbeat },             
  ];

  const formats = [
    { name: 'Reading', icon: faBook },
    { name: 'Listening', icon: faHeadset },
    { name: 'Both', icon: faBook },
  ];

  const fetchData = async () => {
    try {
      const response = await axios.get('https://bookrecaps.cloud/api/book/getallbooks', {
        headers: {
          // 'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,

        },
      });
      const data = response.data;
      const books = data.data.$values.slice(0, 10); // Get the first 5 books
      setBookData(books);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('https://bookrecaps.cloud/api/authors/getallauthors', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const authors = response.data.data.$values.slice(0, 10); // Get the first 5 authors
      setAuthorData(authors);
    } catch (error) {
      console.error("Error fetching author data: ", error);
    }
  };


  useEffect(() => {
    if (step === 3) {
      fetchData(); // Fetch books when on step 4
    } else if (step === 4) {
      fetchAuthors(); // Fetch authors when on step 5
    }
  }, [step]);


  const handleAuthorClick = (author) => { 
    setSelectedAuthors((prevSelected) => {
        const newSelected = prevSelected.includes(author)
            ? prevSelected.filter((a) => a !== author)
            : [...prevSelected, author];

        // Update preferences to include selected authors
        setPreferences((prevState) => ({
            ...prevState,
            authors: newSelected // Update authors in preferences
        }));

        return newSelected;
    });
};
  const handleNext = () => {
    if (step < 5) { // Update condition to allow for the new step
      setStep(step + 1);
    } else {
      onComplete();
      navigate(routes.index);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
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

  const handleImprovementSelection = (selection) => { 
    setPreferences((prevState) => ({
        ...prevState,
        improvement: selection, // Update the improvement preference
    }));
};


  const handleLike = () => {
    setPreferences((prevState) => ({
      ...prevState,
      desiredBook: bookData[currentBookIndex].title, // Update desired book to the liked one
    }));
    handleNext(); // Go to the next step
  };

  const handleDislike = () => {
    setCurrentBookIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex < bookData.length ? nextIndex : prevIndex; // Move to next book if available
    });
  };

  return (
    <div className="onboarding-container">
      {/* Timeline Component */}
 
      <div className="SidebarLogoImg">
          <img src="/logo-transparent.png" alt="Logo" />
        </div>
      <div className="timeline">      
        {["Self-Assessment", "Genre Selection",  "Desired Book",  "Select Author", "Confirmation"].map((label, index) => (
          <div
            key={index}
            className={`timeline-step ${step === index + 1 ? 'active' : ''}`}
            onClick={() => setStep(index + 1)}
          >
            <span className="dot"></span>
            <div className="label">{label}</div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && (
                <div className="step">
                    <h2>Are you looking to improve your time management skills?</h2>
                    <div className="emoji-options">
                      <button
                        className={selectedEmoji === 'No' ? 'selected' : ''}
                        onClick={() => {
                            handleImprovementSelection('No');
                            setSelectedEmoji('No');
                        }}
                    >
                        👍
                    </button>
                    <button
                        className={selectedEmoji === 'Maybe' ? 'selected' : ''}
                        onClick={() => {
                            handleImprovementSelection('Maybe');
                            setSelectedEmoji('Maybe');
                        }}
                    >
                        🤷
                    </button>
                    <button
                        className={selectedEmoji === 'Yes' ? 'selected' : ''}
                        onClick={() => {
                            handleImprovementSelection('Yes');
                            setSelectedEmoji('Yes');
                        }}
                    >
                        👎
                    </button>

                    </div>
                </div>
            )}


      {/* {step === 2 && (
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
      )} */}


      {step === 2 && (
        <div className="step">
          <h2>Select your favorite genre</h2>
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
    
      {/* New Step for Desired Book */}
      {step === 3 && bookData.length > 0 && (
        <div className="step">
          <h2>Select the books that catch your interest</h2>
          <div className="book-suggestions">
            <div className="book-item-itemss">
              <img src={bookData[currentBookIndex].coverImage} alt={bookData[currentBookIndex].title} className="book-image-img" />
              <h4>{bookData[currentBookIndex].title}</h4>
             
            </div>
            {/* <div className="book-item-items">
              <h3>Authors: {bookData[currentBookIndex].author}</h3>
             
            </div> */}

            <div className="like-dislike">
              <button onClick={handleLike} className="like-button">
                <FontAwesomeIcon icon={faHeart} size="2x" /> {/* Tăng kích thước icon */}
              </button>
              <button onClick={handleDislike} className="dislike-button">
              <FontAwesomeIcon icon={faThumbsDown} size="2x" /> {/* Tăng kích thước icon */}
            </button>
              </div>
          </div>
          {/* <div className="navigation-buttons">
            <button onClick={handlePrevious}>Previous</button>
            <button onClick={handleNext}>Next</button>
          </div> */}
        </div>
      )}


      {/* New Step for Select Author */}
      <div>
      {step === 4 && authorData.length > 0 && (
                <div className="step">
                    <h2>Select Your Favorite Author</h2>
                    <div className="author-suggestions">
                        {authorData.map((author, index) => (
                            <div
                                key={index}
                                className={`author-item-item  ${selectedAuthors.includes(author.name) ? 'selected' : ''}`}
                                onClick={() => handleAuthorClick(author.name)} // Assuming author.name holds the name
                            >
                                <img src={author.image} alt={author.name} className="author-image-image" />
                                <h4>{author.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            )}
    </div>

      {step === 5 && (
        <div className="step">
          <h2>You're all set!</h2>
          <p>We will tailor your experience based on your preferences.</p>
          {/* <p>Improvement: {preferences.improvement}</p>  */}
          <p>Topics: {preferences.topics.join(', ')}</p>
        
          <p>Desired Book: {preferences.desiredBook}</p>
          <p>Authors: {preferences.authors.join(', ')}</p>
        </div>
      )}

      <button className="next-button" onClick={handleNext}>
        {step < 6 ? 'Continue' : 'Finish'}
      </button>
      {step > 1 && (
       <button className="next-button" onClick={handlePrevious}>
        Previous
    </button>
)}

    </div>
  );
};

export default Onboarding;
