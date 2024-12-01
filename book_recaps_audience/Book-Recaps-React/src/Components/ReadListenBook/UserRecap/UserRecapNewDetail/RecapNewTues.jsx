import { useEffect, useRef, useState } from 'react';
import { defer, json, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { FaForward, FaPause, FaPlay, FaSyncAlt, FaUndo, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
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

// TODO:
// - Check cases where:
//    Recap is Premium:
//    - user is not logged in -> no audio player, no like, no playlist, no view tracking, no report, no transcript highlighting, no context menu
//    - user is logged in but not premium -> no audio player, no transcript, no view tracking
//    - user is logged in and premium -> everything
//    Recap is Free:
//    - user is not logged in -> no audio player, no like, no playlist, no view tracking, no report, no transcript highlighting, no context menu
//    - user is logged in but not premium -> everything

// NOTE: Do all those TODOs first then style the audio player later (last)

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
  console.log('Recap:', recap);
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
  }, [ recapId, userId ]);

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thích bài viết này.');
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

  const closePlaylistModal = () => {
    setIsPlaylistModalOpen(false);
  };

  const openPlaylistModal = () => {
    setIsPlaylistModalOpen(true);
  };

  const openReportModal = () => {
    setIsReportModalOpen(true);
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  const authors = recap.book.authors?.$values?.map((author) => author.name).join(' · ');
  const categories = recap.book.categories?.$values?.map((category) => category.name).join(' · ');

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
            <p className="text-black bg-yellow-400 text-xs rounded px-2 py-1">Premium</p>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <button
              className="flex gap-1 items-center px-2 py-1 border border-gray-300 bg-white rounded"
              onClick={openReportModal}
            >
              <TbFlag/> <span>Báo cáo</span>
            </button>
            <button
              className={cn("flex gap-1 items-center px-2 py-1 border border-gray-300 bg-white rounded", {
                "text-[#FF6F61]": savedPlayListIds.length > 0
              })}
              onClick={openPlaylistModal}
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
        </div>

      </div>
      <CreatePlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={closePlaylistModal}
        recapId={recapId}
        userId={userId}
        savedPlayListIds={savedPlayListIds}
        setSavedPlayListIds={setSavedPlayListIds}
      />
      <ReportIssueModal isOpen={isReportModalOpen} onClose={closeReportModal} userId={userId} recapId={recapId}/>
    </>
  )
}

const AudioAndTranscriptSection = () => {
  const { recap, promisedTranscript } = useLoaderData();
  const navigate = useNavigate();

  // Audio player state
  const [ isPlaying, setIsPlaying ] = useState(false);
  const [ currentTime, setCurrentTime ] = useState(0);
  const audioRef = useRef(null);

  const { user } = useAuth();
  const hasSubscription = user?.profileData.subscriptions.$values.some((sub) => sub.status === 0);

  // Create view tracking after the transcript is loaded. Delayed by 3 seconds
  useEffect(() => {
    let timeoutId;
    if (recap && user?.id) {
      promisedTranscript.then(() => {
        timeoutId = setTimeout(() => {
          createViewTracking();
        }, 3000);
      });
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, []);

  const createViewTracking = async () => {
    try {
      const deviceType = window.innerWidth <= 768 ? 0 : 1; // Mobile: 0, Desktop: 1
      const response = await axiosInstance.post(`/api/viewtracking/createviewtracking?recapid=${recap.id}&deviceType=${deviceType}`);
      console.log('View tracking response:', response.data);
    } catch (error) {
      const err = handleFetchError(error);
      console.log('Error tracking view:', err);
    }
  };

  const handleUpgradeToPremium = () => {
    navigate(routes.billing);
  };

  const handleSentenceClick = async (startTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = parseFloat(startTime);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Playback error on sentence click:", error);
      }
    }
  };

  return (
    <div className="flex-1">
      <Show when={recap && recap.isPublished}>
        <Show when={(recap.isPremium && hasSubscription) || !recap.isPremium} fallback={
          <div className="rounded-lg bg-white p-5 shadow-[0px_0px_8px_rgba(0,0,0,0.1)]">
            <div className="premium-message">
              This recap is premium. Please upgrade to a premium subscription.
              <button onClick={handleUpgradeToPremium}>Upgrade</button>
            </div>
          </div>
        }>
          <SuspenseAwait
            resolve={promisedTranscript}
            errorElement={<p>No transcript available or failed to load transcript.</p>}
            useDefaultLoading={true}
            defaultLoadingMessage="Loading transcript..."
          >
            {(transcript) => (
              <Transcriptv2
                transcriptData={transcript}
                handleSentenceClick={handleSentenceClick}
                userId={user?.id}
                recapVersionId={recap?.currentVersion?.id}
                currentTime={currentTime}
                isGenAudio={recap?.currentVersion?.isGenAudio || false}
              />
            )}
          </SuspenseAwait>

          <AudioPlayer
            recap={recap}
            audioRef={audioRef}
            currentAudioTime={currentTime}
            setCurrentAudioTime={setCurrentTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </Show>
      </Show>
    </div>
  )
}

const AudioPlayer = ({ recap, audioRef, currentAudioTime, setCurrentAudioTime, isPlaying, setIsPlaying }) => {
  const [ duration, setDuration ] = useState(0);
  const [ isLooping, setIsLooping ] = useState(false);
  const [ playbackRate, setPlaybackRate ] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateCurrentTime = () => setCurrentAudioTime(audio.currentTime || 0);
    audio.addEventListener('timeupdate', updateCurrentTime);
    return () => {
      audio.removeEventListener('timeupdate', updateCurrentTime);
    };
  }, []);

  const handlePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Playback error:', error);
      }
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentAudioTime(newTime);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentAudioTime(Number(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const handleAudioEnded = () => {
    if (isLooping) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlaybackRateChange = (e) => {
    const newRate = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    setPlaybackRate(newRate);
  };

  const handleVolumeChange = (e) => {
    if (audioRef.current) {
      audioRef.current.volume = e.target.value;
    }
  }

  return (
    <div className="audio-player-container">
      {recap.currentVersion.audioURL && (
        <div className="recap-audio-player">
          <audio
            ref={audioRef}
            src={recap.currentVersion.audioURL}
            onLoadedMetadata={handleLoadedMetadata} // This will set the duration
            onTimeUpdate={handleTimeUpdate}         // This will update currentTime
            onEnded={handleAudioEnded}              // Handles end of playback
          />
          <div className="audio-controls">
            <div className="progress-bar">
              <span>{new Date(currentAudioTime * 1000).toISOString().substr(14, 5)}</span>
              <input
                type="range"
                min="0"
                max={duration.toFixed(2) || 0}
                step="0.01"
                value={currentAudioTime.toFixed(2)}
                onChange={handleSeek}
              />
              <span>{new Date((duration - currentAudioTime) * 1000).toISOString().substr(14, 5)}</span>
            </div>
            <div className="audio-control-buttons">
              <button onClick={() => handleSeek({ target: { value: currentAudioTime - 15 } })}>
                <FaUndo/> 15
              </button>
              <button onClick={handlePlayPause} className="play-pause-button">
                {isPlaying ? <FaPause/> : <FaPlay/>}
              </button>
              <button onClick={() => handleSeek({ target: { value: currentAudioTime + 15 } })}>
                <FaForward/> 15
              </button>
              <button onClick={toggleLoop}>
                <FaSyncAlt color={isLooping ? 'grey' : 'black'}/>
              </button>
            </div>
            <div className="volume-controls">
              <FaVolumeDown className="volume-icon"/>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                onChange={handleVolumeChange}
              />
              <FaVolumeUp className="volume-icon"/>
            </div>
            <div className="playback-speed-controls">
              <select
                id="playbackRate"
                value={playbackRate}
                onChange={handlePlaybackRateChange}
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="1.75">1.75x</option>
                <option value="2">2x</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}