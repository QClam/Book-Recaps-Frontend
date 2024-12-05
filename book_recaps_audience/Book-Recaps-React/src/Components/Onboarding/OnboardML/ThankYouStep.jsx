import { useEffect, useState } from "react";
import { Link, useRevalidator } from "react-router-dom";
import { useAuth } from "../../../contexts/Auth";
import { axiosInstance2 } from "../../../utils/axios";
import Show from "../../Show";
import { ProgressSpinner } from "primereact/progressspinner";
import { routes } from "../../../routes";

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

      setLoading(false);
      setError(data.success ? null : data.message);
      setSuccess(data.success ? data.message : null);
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [ userId, categories, authors, books ]);

  // Delay 3 seconds before redirecting to the home page
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      revalidator.revalidate(); // Revalidate the data (sessionLoader) after finishing onboarding
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [ success ]);

  return (
    <div className="thank-you">
      <h2>Cám ơn bạn, {user.name}!</h2>
      <h2>Khảo sát hoàn tất!</h2>
      <p>Chúng tôi sẽ điều chỉnh trải nghiệm của bạn dựa trên kết quả khảo sát</p>
      <div className="summary text-sm">
        <h3 className="font-semibold text-lg">Lựa chọn của bạn:</h3>
        <p><strong>Danh mục sách:</strong> {categories.map(c => c.name).join(', ')}</p>
        <p><strong>Tác giả:</strong> {authors.map(a => a.name).join(', ')}</p>
        <p><strong>Những cuốn sách bạn có hứng thú:</strong> {books.map(b => b.title).join(', ')}</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <Show when={success}>
        <p className="success-message">{success}</p>
        <div className="flex gap-2 items-center justify-center">
          <div>
            <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"/>
          </div>
          <p>Chuyển hướng về trang chủ sau 5 giây...</p>
        </div>
        <div>
          Hoặc <Link to={routes.index} className="text-indigo-600 underline hover:bg-indigo-700">bấm vào đây</Link> nếu
          không muốn chờ đợi
        </div>
      </Show>
      {loading && <p className="loading-message">Loading...</p>}
    </div>
  );
};

export default ThankYouStep;
