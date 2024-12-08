import { useEffect, useRef, useState } from "react";
import { useRevalidator } from "react-router-dom";
import { useAuth } from "../../../contexts/Auth";
import { axiosInstance2 } from "../../../utils/axios";
import Show from "../../Show";
import { ProgressSpinner } from "primereact/progressspinner";

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
  const revalidator = useRevalidator()
  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState(null);
  const [ success, setSuccess ] = useState(null);
  const [ countdown, setCountdown ] = useState(5);
  const timerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    timerRef.current = null;

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
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [ userId, categories, authors, books ]);

  // Delay 3 seconds before redirecting to the home page
  useEffect(() => {
    if (success && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    if (countdown === 0) {
      revalidator.revalidate();
    }
  }, [ success, countdown ]);

  return (
    <div className="thank-you">
      <h1 className="text-green-600 text-2xl">Cám ơn bạn, {user.name}!</h1>
      <h2 className="!text-green-600 !text-2xl mb-3">Khảo sát hoàn tất!</h2>
      <p className="">Chúng tôi sẽ điều chỉnh trải nghiệm của bạn dựa trên kết quả khảo sát</p>
      {/*<div className="summary !text-sm">*/}
      {/*  <h3 className="font-semibold text-lg">Lựa chọn của bạn:</h3>*/}
      {/*  <p><strong>Danh mục sách:</strong> {categories.map(c => c.name).join(', ')}</p>*/}
      {/*  <p><strong>Tác giả:</strong> {authors.map(a => a.name).join(', ')}</p>*/}
      {/*  <p><strong>Những cuốn sách bạn có hứng thú:</strong> {books.map(b => b.title).join(', ')}</p>*/}
      {/*</div>*/}
      {error && <p className="error-message">{error}</p>}
      <Show when={success}>
        <p className="success-message">{success}</p>
        <div className="flex gap-2 items-center justify-center">
          <div>
            <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"/>
          </div>
          <p>Chuyển hướng về trang chủ sau <strong>{countdown} giây</strong>...</p>
        </div>
        <div>
          Hoặc <a href="/" className="text-indigo-600 underline hover:text-indigo-700">bấm vào đây</a> nếu không muốn
          chờ đợi
        </div>
      </Show>
      {loading && <p className="loading-message">Loading...</p>}
    </div>
  );
};

export default ThankYouStep;
