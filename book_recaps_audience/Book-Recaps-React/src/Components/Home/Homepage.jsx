import ForUser from './ForUser/ForUser';
import TopRecap from './TopRecap/TopRecap';
import RecapRecent from './RecapRecent/RecapRecent';
import { useAuth } from "../../contexts/Auth";
import Show from "../Show";
import { getCurrentUserInfo } from "../../utils/getCurrentUserInfo";
import { axiosInstance2 } from "../../utils/axios";
import { defer, json } from "react-router-dom";
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

export async function homepageLoader({ request }) {
  const user = getCurrentUserInfo();
  const recapsForYou = getForYouRecaps(user?.id, request);

  return defer({
    recapsForYou,
  });
}

const Homepage = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="container mx-auto max-w-screen-xl mb-4">
      <Show when={isAuthenticated}>
        <ForUser/>
      </Show>
      <TopRecap/>
      <RecapRecent/>
    </div>
  );
};

export default Homepage;
