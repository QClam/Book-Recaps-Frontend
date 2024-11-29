import { useEffect, useState } from "react";
import { useRevalidator } from "react-router-dom";
import { useAuth } from "../../../contexts/Auth";
import { axiosInstance2 } from "../../../utils/axios";

const postOnboardingFinish = async (userId, categories, authors, books, controller) => {
  try {
    const response = await axiosInstance2.post('/ml/onboarding/finish', {
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


const ThankYouStep = ({ userId = '', categories = [], authors = [], books = [] }) => {
  const { user } = useAuth();
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const [ success, setSuccess ] = useState(null);
  const revalidator = useRevalidator();

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = await postOnboardingFinish(userId, categories, authors, books, controller);
      revalidator.revalidate(); // Revalidate the data (sessionLoader) after finishing onboarding

      setLoading(false);
      setError(data.success ? null : data.message);
      setSuccess(data.success ? data.message : null);
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [ userId, categories, authors, books ]);

  return (
    <div className="thank-you">
      <h2>Thank you, {user.name}!</h2>
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
      {loading && <p className="loading-message">Loading...</p>}
    </div>
  );
};

export default ThankYouStep;
