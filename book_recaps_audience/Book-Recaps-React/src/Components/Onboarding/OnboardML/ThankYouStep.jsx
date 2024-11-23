import { Button } from '@mui/material';
import { useEffect, useState } from "react";
import { axiosInstance } from "../api";

const postOnboardingFinish = async (userId, categories, authors, books, controller) => {
  
  try {
    const response = await axiosInstance.post('/ml/onboarding/finish', {
      user_id: userId,
      category_ids: categories.map(c => c.id),
      author_ids: authors.map(a => a.id),
      book_ids: books.map(b => b.id)
    }, {
      signal: controller.signal,
     
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error("Error finishing onboarding:", error);
    return {
      success: false,
      message: ""
    };
  }
};

const markOnboardingComplete = async () => {
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  const handleTokenRefresh = async () => {
    try {
      const response = await axiosInstance.post("https://bookrecaps.cloud/api/tokens/refresh", {
        refreshToken,
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw new Error("Session expired. Please log in again.");
    }
  };

  try {
    const response = await axiosInstance.put('https://bookrecaps.cloud/api/personal/changeisOnboard', null, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log("Onboarding status updated:", response.data);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token expired, attempt to refresh and retry
      const newAccessToken = await handleTokenRefresh();
      return markOnboardingComplete(newAccessToken); // Retry with new token
    } else {
      console.error("", error);
    }
  }
};

const ThankYouStep = ({ userName, userId = '', categories = [], authors = [], books = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const data = await postOnboardingFinish(userId, categories, authors, books, controller);
      console.log(data);

      setLoading(false);
      setError(data.success ? null : data.message);
      setSuccess(data.success ? data.message : null);
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [userId, categories, authors, books]);

  const handleGoToHome = async () => {
    setLoading(true);
    await markOnboardingComplete();
    setLoading(false);
    window.location.href = '/explore';
  };

  return (
    <div className="thank-you">
      <h2>Thank you, {userName}!</h2>
      <h2>You're all set!</h2>
      <p>We will tailor your experience based on your preferences</p>
      <div className="summary">
        <h3>Your Choices:</h3>
        <p><strong>Categories:</strong> {categories.map(c => c.name).join(', ')}</p>
        <p><strong>Authors:</strong> {authors.map(a => a.name).join(', ')}</p>
        <p><strong>Books you liked:</strong> {books.map(b => b.title).join(', ')}</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      {loading && <p>Loading...</p>}
      <br />
      <Button variant="contained" color="primary" disabled={loading} onClick={handleGoToHome}>
        Go to Home
      </Button>
    </div>
  );
};

export default ThankYouStep;
