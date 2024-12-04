import PlaylistBook from './PlaylistBook/PlaylistBook';
import { axiosInstance } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import { defer, json, useLoaderData } from "react-router-dom";
import SuspenseAwait from "../SuspenseAwait";

const getPlaylists = async (request) => {
  try {
    const response = await axiosInstance.get("/api/playlists/my-playlists", {
      signal: request.signal
    });

    console.log(response.data.data);
    return response.data.data?.$values || [];
  } catch (e) {
    const err = handleFetchError(e);
    if (err.status === 400) {
      return [];
    }
    throw json({ error: err.error }, { status: err.status });
  }
}

export const playlistLoader = async ({ request }) => {
  const promisedPlaylists = getPlaylists(request);

  return defer({
    promisedPlaylists
  })
}

const LibraryBook = () => {
  const { promisedPlaylists } = useLoaderData();

  return (
    <div className="container mx-auto max-w-screen-xl mb-4">
      <SuspenseAwait
        fallback={<div className="text-center">Loading playlists...</div>}
        resolve={promisedPlaylists}
        errorElement={<div className="text-center">Error fetching playlists</div>}
      >
        {(playlists) => <PlaylistBook playlistsData={playlists}/>}
      </SuspenseAwait>
    </div>
  );
};

export default LibraryBook;
