import { useState } from 'react';
import { Button, Step, StepLabel, Stepper } from '@mui/material';
import './OnboardingStepper.css';
import CategorySelection from './CategorySelection';
import AuthorSelection from './AuthorSelection';
import BookSelection from './BookSelection';
import ThankYouStep from './ThankYouStep';
import bookListen from "../../../image/bookListen.jpg";
import { useAuth } from "../../../contexts/Auth";
import { Link } from "react-router-dom";
import { routes } from "../../../routes";

const OnboardingStepper = () => {
  const { user, isAuthenticated } = useAuth();
  const [ activeStep, setActiveStep ] = useState(0); // Start at welcome step
  const [ selectedCategories, setSelectedCategories ] = useState([]);
  const [ selectedAuthors, setSelectedAuthors ] = useState([]);
  const [ selectedBooks, setSelectedBooks ] = useState([]);

  const steps = [ "Welcome", "Category Selection", "Author Selection", "Desired Book", "Done" ];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
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
              <img src={bookListen} alt="Welcome illustration" className="welcome-illustration"/>
            </div>

            <h2 className="mb-2">Xin chào, {user.name ? user.name : 'User'}!</h2>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!isAuthenticated}
            >
              Bắt đầu
            </Button>
            {!isAuthenticated && (<p className="login-message">Please login to start onboarding</p>)}
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
          userId={user.id}
        />

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="relative text-center mb-7">
        <h1 className="text-xl font-bold">
          Cá nhân hóa trải nghiệm
        </h1>
        <p className="max-w-screen-md mx-auto">
          Điều này sẽ giúp chúng tôi hiểu hơn về bạn và đề xuất nội dung phù hợp với bạn.
        </p>
        <Link
          to={routes.logout}
          className="absolute top-0 right-0 underline hover:text-[#FF6F61]"
        >
          Logout
        </Link>
      </div>
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
          {activeStep > 0 && activeStep < steps.length - 1 && (
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
