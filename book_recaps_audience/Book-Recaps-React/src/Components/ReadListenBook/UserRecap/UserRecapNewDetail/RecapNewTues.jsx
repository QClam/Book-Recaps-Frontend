import { useEffect, useRef, useState } from 'react';
import { defer, json, Link, useLoaderData, useParams } from 'react-router-dom';
import './RecapNewTues.scss';
import '../Transcript.scss';
import CreatePlaylistModal from '../PlaylistModal/CreatePlaylistModal';
import ReportIssueModal from '../ReportIssueModal/ReportIssueModal';
import Transcriptv2 from '../NewRecapBook/Transcriptv2';
import { useAuth } from "../../../../contexts/Auth";
import axios from 'axios';
import { axiosInstance } from "../../../../utils/axios";
import { routes } from "../../../../routes";
import Show from "../../../Show";
import { handleFetchError } from "../../../../utils/handleFetchError";
import SuspenseAwait from "../../../SuspenseAwait";
import { Image } from "primereact/image";
import { Divider } from "primereact/divider";
import { RiEyeLine, RiHeadphoneLine, RiThumbUpFill, RiThumbUpLine } from "react-icons/ri";
import { cn } from "../../../../utils/cn";
import { HiBookmark, HiOutlineBookmark } from "react-icons/hi";
import { TbFlag } from "react-icons/tb";
import { getCurrentUserInfo } from "../../../../utils/getCurrentUserInfo";
import {
  MediaControlBar,
  MediaController,
  MediaDurationDisplay,
  MediaMuteButton,
  MediaPlayButton,
  MediaPreviewTimeDisplay,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange
} from "media-chrome/react";
import { MediaProvider, useMediaRef } from "media-chrome/react/media-store";
import { MediaPlaybackRateMenu, MediaPlaybackRateMenuButton } from "media-chrome/react/menu";
import { toast } from "react-toastify";

const getRecap = async (recapId, request) => {
  try {
    const user = getCurrentUserInfo();
    const response = await axiosInstance.get("/getrecapbyId/" + recapId, {
      params: {
        userid: user?.id
      },
      signal: request.signal,
    });
    return { ...response.data.data, ...response.data.data2 };
  } catch (e) {
    const err = handleFetchError(e);
    throw json({ error: err.error }, { status: err.status });
  }
}

const getTranscript = async (transcriptUrl, request) => {
  if (!transcriptUrl) throw json({ error: 'Transcript URL is not available' }, { status: 404 });
  try {
    const response = await axios.get(transcriptUrl, { signal: request.signal });
    return response.data;
  } catch (e) {
    const err = handleFetchError(e);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const recapPlayerLoader = async ({ params, request }) => {
  const recap = await getRecap(params.recapId, request);
  const promisedTranscript = getTranscript(recap.currentVersion?.transcriptUrl, request);

  return defer({ recap, promisedTranscript });
}

const RecapNewTues = () => {
  return (
    <div className="max-w-screen-lg mx-auto mt-10 mb-[72px] px-5 flex gap-4 flex-col md:flex-row">
      <RecapInfoSection/>
      <AudioAndTranscriptSection/>
    </div>
  );
};

export default RecapNewTues;

const RecapInfoSection = () => {
  const { recap } = useLoaderData();
  const { recapId } = useParams();
  const [ isPlaylistModalOpen, setIsPlaylistModalOpen ] = useState(false);
  const [ isReportModalOpen, setIsReportModalOpen ] = useState(false); // State for report modal
  const [ likeCount, setLikeCount ] = useState(recap.likesCount || 0);
  const [ liked, setLiked ] = useState(recap.isLiked);

  const [ savedPlayListIds, setSavedPlayListIds ] = useState(recap.playListItems.$values.map((item) => item.playListId));

  const { user, isAuthenticated } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const response = await axiosInstance.get(`/api/likes/count/${recapId}`);

        if (response.status === 200) {
          setLikeCount(response.data.data);
        } else {
          console.error('Error fetching like count:', response.data);
        }
      } catch (error) {
        console.error('Error fetching like count:', error.response?.data || error.message);
      }
    };

    fetchLikeCount();
  }, []);

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      toast.warning("Vui lòng đăng nhập để thích bài viết.");
      return;
    }

    try {
      let response;
      if (liked) {
        // Gửi yêu cầu DELETE để hủy like
        response = await axiosInstance.delete(`/api/likes/remove/${recapId}`);

        if (response.status === 200) {
          setLiked(false);
          setLikeCount(likeCount - 1);
        } else {
          console.error('Error removing like:', response.data);
        }
      } else {
        // Gửi yêu cầu POST để thêm like
        response = await axiosInstance.post(`/api/likes/createlike/${recapId}`, {
          recapId: recapId,
          userId: userId,
        });

        if (response.status === 200) {
          setLiked(true);
          setLikeCount(likeCount + 1);
        } else {
          console.error('Error liking recap:', response.data);
        }
      }
    } catch (error) {
      console.error('Error handling like action:', error.response?.data || error.message);
    }
  };

  const authors = recap.book.authors?.$values?.map((author) => author.name).join(' · ');
  const categories = recap.book.categories?.$values?.map((category) => category.name).join(' · ');
  const hasSubscription = user?.profileData.subscriptions.$values.some((sub) => sub.status === 0);

  return (
    <>
      <div className="w-full md:w-1/3 md:sticky h-fit top-28">
        <div className="md:px-5">
          {/* Book info */}
          <div className="flex items-center md:items-start md:flex-col gap-5 md:gap-1">
            <div className="w-2/5">
              <Image
                src={recap.book.coverImage || "/empty-image.jpg"}
                alt={recap.book.title + " (" + recap.book.publicationYear + ")"}
                className="block overflow-hidden rounded-md shadow-md w-full"
                imageClassName="aspect-[3/4] object-cover w-full bg-white"
                preview
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{recap.book.title} ({recap.book.publicationYear})</h1>
              {recap.book.originalTitle && (
                <h2 className="text-gray-700 italic md:text-sm">
                  Tên gốc: <strong>{recap.book.originalTitle}</strong>
                </h2>
              )}
              {authors && (
                <p className="mt-2 md:text-sm text-gray-700 line-clamp-1" title={authors}>
                  <span className="text-gray-500">Của: </span>
                  <strong>{authors}</strong>
                </p>
              )}
              {categories && (
                <p className="mt-2 md:text-sm text-gray-500 line-clamp-1" title={categories}>{categories}</p>
              )}
            </div>
          </div>

          <Divider/>

          {recap.contributor && (
            <div className="flex gap-2 items-center text-sm mb-2">
              <div className="w-8 h-8">
                <img
                  src={recap.contributor.imageUrl?.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png'}
                  alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
              </div>
              <p className="font-semibold line-clamp-2">{recap.contributor.fullName}</p>
            </div>
          )}

          <p className="mb-2 text-gray-700 italic line-clamp-2 flex-1" title={recap.name || recap.book.title}>
            Bài viết: <strong>{recap.name || `"${recap.book.title}"`}</strong>
          </p>

          {/* Views, Likes, Audio length*/}
          <div className="flex gap-2 items-center text-sm text-gray-500 flex-wrap">
            <p className="flex items-center gap-2">
              <span className="bg-green-100 p-1 rounded"><RiEyeLine size={17}/></span>
              <span>{recap.viewsCount || 0} Lượt xem</span>
            </p>
            <p>·</p>
            <p className="flex items-center gap-2">
              <span className="bg-green-100 p-1 rounded"><RiThumbUpLine size={17}/></span>
              <span>{likeCount || 0} Lượt thích</span>
            </p>
            <p>·</p>
            <p className="flex items-center gap-2">
              <span className="bg-green-100 p-1 rounded"><RiHeadphoneLine size={17}/></span>
              <span>{Number((recap.currentVersion?.audioLength || 0) / 60).toFixed(0)} phút</span>
            </p>
            <p>·</p>
            <Show when={recap.isPremium}>
              <p className="text-black bg-yellow-400 text-xs rounded px-2 py-1">Premium</p>
            </Show>
          </div>

          <Show when={isAuthenticated}>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Show when={!(recap.isPremium && !hasSubscription)}>
                <button
                  className="flex gap-1 items-center px-2 py-1 border border-gray-300 bg-white rounded"
                  onClick={() => setIsReportModalOpen(true)}
                >
                  <TbFlag/> <span>Báo cáo</span>
                </button>
              </Show>
              <button
                className={cn("flex gap-1 items-center px-2 py-1 border border-gray-300 bg-white rounded", {
                  "text-[#FF6F61]": savedPlayListIds.length > 0
                })}
                onClick={() => setIsPlaylistModalOpen(true)}
              >
                {savedPlayListIds.length > 0 ? <HiBookmark/> : <HiOutlineBookmark/>} <span>Lưu</span>
              </button>
              <button
                className={cn("flex gap-1 items-center px-2 py-1 border border-gray-300 bg-white rounded", { "text-[#FF6F61]": liked })}
                onClick={handleLikeClick}
              >
                {liked ? <><RiThumbUpFill size={17}/> <span>Liked</span></> :
                  <><RiThumbUpLine size={17}/><span>Like</span></>}
              </button>
            </div>
          </Show>
        </div>
      </div>
      <CreatePlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        recapId={recapId}
        userId={userId}
        savedPlayListIds={savedPlayListIds}
        setSavedPlayListIds={setSavedPlayListIds}
      />
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userId={userId}
        recapId={recapId}
      />
    </>
  )
}

const AudioAndTranscriptSection = () => {
  const { recap, promisedTranscript } = useLoaderData();
  const { user } = useAuth();
  const hasSubscription = user?.profileData.subscriptions.$values.some((sub) => sub.status === 0);

  // Create view tracking when the transcript is loaded. Delayed by 3 seconds
  useViewTracking(
    recap.id,
    user?.id,
    promisedTranscript,
    recap.isPublished && ((recap.isPremium && hasSubscription) || !recap.isPremium) && recap.currentVersion?.status === 2
  );

  return (
    <MediaProvider>
      <div className="flex-1">
        <Show when={recap && recap.isPublished} fallback={
          <div className="rounded-lg bg-white p-5 shadow-[0px_0px_8px_rgba(0,0,0,0.1)]">
            <div className="premium-message">
              Bài viết này chưa được công khai. Vui lòng quay lại sau.
            </div>
          </div>
        }>
          <Show when={recap.currentVersion?.status !== 2} fallback={
            <div className="rounded-lg bg-white p-5 shadow-[0px_0px_8px_rgba(0,0,0,0.1)]">
              <div className="premium-message">
                Bài viết này đang được xem xét. Vui lòng quay lại sau.
              </div>
            </div>
          }>
            <Show when={(recap.isPremium && hasSubscription) || !recap.isPremium} fallback={
              <div className="rounded-lg bg-white p-5 shadow-[0px_0px_8px_rgba(0,0,0,0.1)]">
                <div className="premium-message">
                  Bài viết này yêu cầu tài khoản Premium. Vui lòng nâng cấp tài khoản để nghe bài viết này.
                  <Link to={routes.billing}>Nâng cấp ngay</Link>
                </div>
              </div>
            }>
              <SuspenseAwait
                resolve={promisedTranscript}
                errorElement={<p>Không có transcript hoặc không thể tải transcript.</p>}
                useDefaultLoading={true}
                defaultLoadingMessage="Loading transcript..."
              >
                {(transcript) => (
                  <Transcriptv2
                    transcriptData={transcript}
                    // handleSentenceClick={handleSentenceClick}
                    userId={user?.id}
                    recapVersionId={recap?.currentVersion?.id}
                    // currentTime={currentTime}
                    isGenAudio={recap?.currentVersion?.isGenAudio || false}
                  />
                )}
              </SuspenseAwait>

              <AudioPlayer audioURL={recap.currentVersion?.audioURL}/>
            </Show>
          </Show>
        </Show>
      </div>
    </MediaProvider>
  )
}

const AudioPlayer = ({ audioURL }) => {
  const mediaRef = useMediaRef();
  return (
    <div>
      {audioURL && (
        <div className="recap-audio-player">
          <SvgIcons/>
          <MediaController audio className="@container block max-w-screen-md mx-auto px-5">
            <audio slot="media" ref={mediaRef} src={audioURL}/>
            <div className="flex gap-2 items-center">
              <MediaTimeDisplay
                className="block p-2 text-slate-500 text-sm rounded-md focus:outline-none focus:ring-slate-700 focus:ring-2"/>

              <MediaTimeRange
                className="block w-full h-2 min-h-0 p-0 bg-slate-50 focus-visible:ring-slate-700 focus-visible:ring-2">
                <MediaPreviewTimeDisplay slot="preview" className="text-slate-600 text-xs"/>
              </MediaTimeRange>

              <MediaDurationDisplay className="block p-2 text-slate-500 text-sm"/>
            </div>

            <MediaControlBar className="h-14 px-4 w-full flex items-center justify-between">
              <div className="relative group">
                <MediaMuteButton
                  noTooltip
                  className="order-first @md:order-none rounded-md focus:outline-none focus-visible:ring-slate-700 focus-visible:ring-2">
                  <svg slot="high" aria-hidden="true" className="h-5 w-5 fill-slate-500">
                    <use href="#high"/>
                  </svg>
                  <svg slot="medium" aria-hidden="true" className="h-5 w-5 fill-slate-500">
                    <use href="#high"/>
                  </svg>
                  <svg slot="low" aria-hidden="true" className="h-5 w-5 fill-slate-500">
                    <use href="#high"/>
                  </svg>
                  <svg slot="off" aria-hidden="true" className="h-5 w-5 fill-slate-500">
                    <use href="#off"/>
                  </svg>
                </MediaMuteButton>
                <MediaVolumeRange
                  className="group-hover:block hidden absolute bg-slate-800 border border-gray-700 rounded-lg shadow-lg mt-2 w-40 z-10 p-4 bottom-full left-0"
                />
              </div>
              <MediaSeekBackwardButton
                className="w-8 h-8 p-0 group rounded-full focus:outline-none focus-visible:ring-slate-700 focus-visible:ring-2"
                seekOffset={10}>
                <svg
                  slot="icon"
                  aria-hidden="true"
                  className="w-7 h-7 fill-none stroke-slate-500"
                >
                  <use href="#backward"/>
                </svg>
              </MediaSeekBackwardButton>
              <MediaPlayButton
                className="h-10 w-10 p-2 mx-3 rounded-full bg-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-slate-700 focus:ring-2 focus:ring-offset-2">
                <svg slot="play" aria-hidden="true" className="relative left-px">
                  <use href="#play"/>
                </svg>
                <svg slot="pause" aria-hidden="true">
                  <use href="#pause"/>
                </svg>
              </MediaPlayButton>
              <MediaSeekForwardButton
                className="w-8 h-8 p-0 group relative rounded-full focus:outline-none focus-visible:ring-slate-700 focus-visible:ring-2"
                seekOffset={10}>
                <svg
                  slot="icon"
                  aria-hidden="true"
                  className="w-7 h-7 fill-none stroke-slate-500"
                >
                  <use href="#forward"/>
                </svg>
              </MediaSeekForwardButton>
              <MediaPlaybackRateMenuButton
                className="text-slate-500 rounded-md focus:outline-none focus-visible:ring-slate-700 focus-visible:ring-2 select-none"
                id="menu-button"
                invoketarget="menu1"
              />
              <MediaPlaybackRateMenu
                hidden
                id="menu1"
                anchor="menu-button"
                rates={[ 2, 1.5, 1.25, 1, 0.75 ]}
                className="z-10"
              />
            </MediaControlBar>
          </MediaController>
        </div>
      )}
    </div>
  )
}

const SvgIcons = () => (
  <svg className="hidden">
    <symbol
      id="backward"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M8 5L5 8M5 8L8 11M5 8H13.5C16.5376 8 19 10.4624 19 13.5C19 15.4826 18.148 17.2202 17 18.188"
      ></path>
      <path d="M5 15V19"></path>
      <path
        d="M8 18V16C8 15.4477 8.44772 15 9 15H10C10.5523 15 11 15.4477 11 16V18C11 18.5523
            10.5523 19 10 19H9C8.44772 19 8 18.5523 8 18Z"
      ></path>
    </symbol>

    <symbol id="play" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0
            3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
        clipRule="evenodd"
      />
    </symbol>

    <symbol id="pause" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0
          01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0
          01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
        clipRule="evenodd"
      />
    </symbol>

    <symbol id="forward" viewBox="0 0 24 24">
      <path
        d="M16 5L19 8M19 8L16 11M19 8H10.5C7.46243 8 5 10.4624 5 13.5C5 15.4826 5.85204 17.2202 7 18.188"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M13 15V19"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M16 18V16C16 15.4477 16.4477 15 17 15H18C18.5523 15 19 15.4477 19 16V18C19 18.5523 18.5523 19 18
          19H17C16.4477 19 16 18.5523 16 18Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </symbol>

    <symbol id="high" viewBox="0 0 24 24">
      <path
        d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0
          001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276
          2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06
          8.25 8.25 0 000-11.668.75.75 0 010-1.06z"
      ></path>
      <path
        d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0
          010-1.06z"
      ></path>
    </symbol>

    <symbol id="off" viewBox="0 0 24 24">
      <path
        d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0
          001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276
          2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72
          1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z"
      />
    </symbol>
  </svg>
)

const useViewTracking = (recapId, userId, promisedTranscript, shouldCreate) => {
  const currentViewTrackingId = useRef(null);
  const startTime = useRef(new Date().getTime());
  const mounted = useRef(false);

  useEffect(() => {
    let timeoutId;
    const controller = new AbortController();

    // Create view tracking after the transcript is loaded. Delayed by 3 seconds
    if (recapId && !mounted.current && shouldCreate) {
      promisedTranscript.then(() => {
        timeoutId = setTimeout(() => {
          createViewTracking(controller);
        }, 3000);
      });
    }

    // Update view tracking duration when the component is unmounted
    return () => {
      controller.abort();
      if (timeoutId) clearTimeout(timeoutId);
      if (currentViewTrackingId.current) {
        const endTime = new Date().getTime();
        const duration = (endTime - startTime.current) / 1000;
        updateViewTracking(currentViewTrackingId.current, duration);
        currentViewTrackingId.current = null;
      }
    }
  }, [ userId, shouldCreate ]);

  useEffect(() => {
    if (mounted.current) window.location.reload();
    mounted.current = true;
  }, [ userId ]);

  const createViewTracking = async (request) => {
    try {
      const deviceType = window.innerWidth <= 768 ? 0 : 1; // Mobile: 0, Desktop: 1
      const response = await axiosInstance.post("/api/viewtracking/createviewtracking", {}, {
        signal: request.signal,
        params: {
          recapid: recapId,
          deviceType,
          userId
        }
      });
      // console.log('View tracking response:', response.data.data);

      currentViewTrackingId.current = response.data.data?.id;
    } catch (error) {
      const err = handleFetchError(error);
      console.log('Error tracking view:', err);
    }
  };

  const updateViewTracking = (id, duration) => {
    if (!id || !duration) return;
    duration = Math.round(duration);

    axiosInstance.put("/api/viewtracking/updateduration/" + id, {}, { params: { duration } }).then(response => {
      console.log('Update View tracking response:', response.data);
    }).catch(error => {
      const err = handleFetchError(error);
      console.log('Error tracking view:', err);
    })
  };
}