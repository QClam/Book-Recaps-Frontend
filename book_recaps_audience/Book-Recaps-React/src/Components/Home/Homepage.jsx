import ForUser from './ForUser/ForUser';
import { useAuth } from "../../contexts/Auth";
import Show from "../Show";
import { getCurrentUserInfo } from "../../utils/getCurrentUserInfo";
import { axiosInstance2 } from "../../utils/axios";
import { defer, json, useLoaderData } from "react-router-dom";
import { handleFetchError } from "../../utils/handleFetchError";

const getForYouRecaps = async (userId, request) => {
  if (!userId) return null;
  try {
    const response = await axiosInstance2.get('/ml/recommendations/for-you?user=' + userId, {
      signal: request.signal
    })

    return response.data;
  } catch (e) {
    const err = handleFetchError(e);
    throw json({ error: err.error }, { status: err.status });
  }
};

const getTopRecaps = async (request) => {
  try {
    const response = await axiosInstance2.get('/ml/recommendations/top-recaps', {
      signal: request.signal
    })

    return response.data;
  } catch (e) {
    const err = handleFetchError(e);
    throw json({ error: err.error }, { status: err.status });
  }
};

const getRecentlyAddedRecaps = async (request) => {
  try {
    const response = await axiosInstance2.get('/ml/recommendations/recently-added-recaps', {
      signal: request.signal
    })

    return response.data;
  } catch (e) {
    const err = handleFetchError(e);
    throw json({ error: err.error }, { status: err.status });
  }
};

export async function homepageLoader({ request }) {
  const user = getCurrentUserInfo();
  const recapsForYou = getForYouRecaps(user?.id, request);
  const topRecaps = getTopRecaps(request);
  const recentlyAddedRecaps = getRecentlyAddedRecaps(request);

  return defer({
    recapsForYou,
    topRecaps,
    recentlyAddedRecaps
  });
}

const Homepage = () => {
  const { recapsForYou, topRecaps, recentlyAddedRecaps } = useLoaderData();
  const { isAuthenticated } = useAuth();

  return (
    <div className="container mx-auto max-w-screen-xl mb-4">
      <Show when={isAuthenticated}>
        <ForUser
          promisedRecaps={recapsForYou}
          emptyMessageIdx={0}
          title="Đề xuất cho bạn"
          description="Các bài viết được đề xuất dựa trên lịch sử xem của bạn"
        />
      </Show>
      <ForUser
        promisedRecaps={topRecaps}
        emptyMessageIdx={1}
        title="Top bài viết"
        description="Các bài viết có điểm tương tác cao nhất"
      />
      <ForUser
        promisedRecaps={recentlyAddedRecaps}
        emptyMessageIdx={1}
        title="Bài viết mới nhất"
        description="Các bài viết mới được thêm vào hệ thống"
      />
    </div>
  );
};

export default Homepage;
