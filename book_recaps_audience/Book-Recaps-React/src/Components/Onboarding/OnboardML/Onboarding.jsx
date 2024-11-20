import { useState, useEffect } from 'react';
import { Button, Step, StepLabel, Stepper, TextField } from '@mui/material';
import './OnboardingStepper.css';
import CategorySelection from './CategorySelection';
import AuthorSelection from './AuthorSelection';
import BookSelection from './BookSelection';
import ThankYouStep from './ThankYouStep';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import bookListen from "../../../image/bookListen.jpg";

const OnboardingStepper = () => {
  const [ activeStep, setActiveStep ] = useState(0); // Start at welcome step
  const [ userId, setUserId ] = useState('');
  const [ selectedCategories, setSelectedCategories ] = useState([]);
  const [ selectedAuthors, setSelectedAuthors ] = useState([]);
  const [ selectedBooks, setSelectedBooks ] = useState([]);
  const [userName, setUserName] = useState('');
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          'https://160.25.80.100:7124/api/personal/profile',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setUserName(response.data.userName);
        setUserId(response.data.id);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchUserProfile(); // Retry after refreshing token
        } else {
          setError("Error fetching user profile.");
          console.error("Error fetching user profile:", error);
        }
      }
    };


    const handleTokenRefresh = async () => {
      try {
        const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
          refreshToken,
        });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;
        localStorage.setItem("authToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
      } catch (error) {
        console.error("Error refreshing token:", error);
        setError("Session expired. Please log in again.");
      }
    };

    fetchUserProfile();
  }, [accessToken, refreshToken]);


  const handleCompleteOnboarding = () => {
    // Đặt cờ isOnboarded thành true trong localStorage
    localStorage.setItem("isOnboarded", true);
    navigate("/explore"); // Điều hướng đến trang explore sau khi hoàn thành onboarding
  };

  const steps = [ "Welcome", "Category Selection", "Author Selection", "Desired Book", "Done" ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleCompleteOnboarding(); // Hoàn thành onboarding nếu ở bước cuối
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleCategorySelection = (categories) => {
    setSelectedCategories(categories);
  };

  const handleAuthorSelection = (authors) => {
    setSelectedAuthors(authors);
  };

  const handleBookSelection = (book) => {
    setSelectedBooks(prev => [ ...prev, book ]);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="welcome-step">
            <div className="welcome-image-container">
        
        <img src={bookListen} alt="Welcome illustration" className="welcome-illustration" />
      </div>

            <h2>Welcome, {userName ? userName : 'User'}!</h2>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!userName}
            >
              Start Onboarding
            </Button>
            {error && <p className="error">{error}</p>}
          </div>
        );

      case 1:
        return <CategorySelection
          onNext={handleNext}
          onCategorySelect={handleCategorySelection}
        />;
      case 2:
        return <AuthorSelection
          onNext={handleNext}
          onAuthorSelect={handleAuthorSelection}
          selectedCategories={selectedCategories}
        />;
      case 3:
        return <BookSelection
          onNext={handleNext}
          onBookSelect={handleBookSelection}
          selectedCategories={selectedCategories}
          selectedAuthors={selectedAuthors}
        />;
      case 4:
              return <ThankYouStep
        categories={selectedCategories}
        authors={selectedAuthors}
        books={selectedBooks}
        userName={userName} // Pass userName instead of userId if needed
        userId={userId}
      />

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="onboarding-container">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div className="step-content-wrapper">
        {renderStepContent(activeStep)}
        <div className="navigation-buttons">
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepper;
