import axios from "axios";
import {
  Await,
  defer,
  generatePath,
  json,
  Link,
  redirect,
  useAsyncValue,
  useLoaderData,
  useNavigate
} from "react-router-dom";
import { Fragment, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "react-use";
import { TabPanel, TabView } from 'primereact/tabview';
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from 'primereact/divider';
import { Badge } from "primereact/badge";
import { Dialog } from "primereact/dialog";
import { Image } from "primereact/image";
import { Message } from "primereact/message";
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
import {
  MediaActionTypes,
  MediaProvider,
  useMediaDispatch,
  useMediaRef,
  useMediaSelector
} from "media-chrome/react/media-store";
import { MediaPlaybackRateMenu, MediaPlaybackRateMenuButton } from "media-chrome/react/menu";
import { TbExclamationCircle } from "react-icons/tb";

import { axiosInstance, axiosInstance2 } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import Show from "../../components/Show";
import { cn } from "../../utils/cn";
import { routes } from "../../routes";
import { useToast } from "../../contexts/Toast";
import { getBookInfoByRecap } from "../fetch";
import CustomBreadCrumb from "../../components/CustomBreadCrumb";
import { RecapVersionProvider, useRecapVersion } from "../../contexts/RecapVersion";
import Modal from "../../components/modal";
import BookInfo from "../../components/BookInfo";
import { CgArrowsExpandLeft, CgClose } from "react-icons/cg";
import { getCurrentUserInfo } from "../../utils/getCurrentUserInfo";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { Tooltip } from "primereact/tooltip";
import CreateAppealDialog from "../../components/CreateAppealDialog";

const getRecapVersion = async (versionId, request) => {
  try {
    const response = await axiosInstance.get('/version/' + versionId, {
      signal: request.signal
    });
    return response.data.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

const getKeyIdeas = async (versionId, request) => {
  try {
    const response = await axiosInstance2.get('/key-ideas/by-recap-version/' + versionId, {
      signal: request.signal
    });
    return response.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

const getTranscript = async (versionId, request) => {
  try {
    const response = await axiosInstance2.get('/mfa/transcripts/' + versionId, {
      signal: request.signal
    });
    return response.data;
  } catch (error) {
    const err = handleFetchError(error);
    // throw json({ error: err.error }, { status: err.status });
    console.log("err", err);
    return null;
  }
}

const getReview = async (versionId, request) => {
  try {
    const response = await axiosInstance2.get('/reviews/by-recap-version/' + versionId, {
      signal: request.signal
    });
    return response.data;
  } catch (error) {
    const err = handleFetchError(error);
    console.log("err", err);
    return null;
  }
}

const getPlagiarismResults = async (versionId, controller) => {
  try {
    const response = await axiosInstance2.get(
      "/plagiarism/get-results/" + versionId,
      {
        signal: controller.signal,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching plagiarism results:", error);
    return null;
  }
};

const checkPlagiarism = async (versionId) => {
  try {
    const response = await axiosInstance2.get(
      "/plagiarism/check-plagiarism/" + versionId
    );
    return response.data;
  } catch (error) {
    console.error("Error checking plagiarism:", error);
    return null;
  }
};

const getRecapInfo = async (recapId, request) => {
  try {
    const response = await axiosInstance.get('/getrecapbyId/' + recapId, {
      signal: request.signal
    });

    return response.data.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const recapVersionLoader = async ({ params, request }) => {
  const recapVersion = await getRecapVersion(params.versionId, request);
  const recap = await getRecapInfo(recapVersion.recapId, request);

  const user = getCurrentUserInfo();
  if (recap.userId.toLowerCase() !== user.id.toLowerCase()) {
    return redirect(routes.recaps);
  }

  const bookInfo = getBookInfoByRecap(recapVersion.recapId, request);
  const keyIdeas = getKeyIdeas(params.versionId, request);
  const transcript = getTranscript(params.versionId, request);
  const review = getReview(params.versionId, request);

  return defer({
    recapVersion,
    keyIdeas,
    bookInfo,
    transcript,
    review
  });
}

const RecapVersion = () => {
  const { recapVersion, keyIdeas, bookInfo } = useLoaderData();

  return (
    <RecapVersionProvider initialRecapVersion={recapVersion} deferredKeyIdeas={keyIdeas}>
      <div className="relative flex h-full">
        <div className="flex-1 pb-8 px-6 overflow-y-auto">
          <CustomBreadCrumb items={[
            { label: "Recaps", path: routes.recaps },
            { label: "Recap details", path: generatePath(routes.recapDetails, { recapId: recapVersion.recapId }) },
            { label: recapVersion.versionName || "Version details" }
          ]}/>

          {/* Book info */}
          <Suspense fallback={<SuspenseFallback message="Loading book info..."/>}>
            <Await resolve={bookInfo} errorElement={
              <div className="h-14 flex gap-2 justify-center items-center italic font-semibold text-gray-400">
                Error loading book info!
              </div>
            }>
              {(book) => <BookInfo book={book} compact={true}/>}
            </Await>
          </Suspense>

          {/* Main panel */}
          <MainPanel/>
        </div>

        <RightSidePanel/>
      </div>
    </RecapVersionProvider>
  );
}

export default RecapVersion;

const SuspenseFallback = ({ message }) => (
  <div className="h-32 flex gap-2 justify-center items-center">
    <div>
      <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                       fill="var(--surface-ground)" animationDuration=".5s"/>
    </div>
    <p>{message}</p>
  </div>
)

const handleClickForHighlight = (targetId, appliedClasses = [], targetClassName = false) => {
  let targetElements;

  if (targetClassName) {
    targetElements = document.getElementsByClassName(targetId); // Returns an HTMLCollection
  } else {
    targetElements = [ document.getElementById(targetId) ]; // Wrap in an array for consistency
  }

  if (targetElements && targetElements.length > 0) {
    // Iterate over the collection of elements
    Array.from(targetElements).forEach(targetElement => {
      if (targetElement) {
        // Scroll into view for each element
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add focus classes for animation
        targetElement.classList.add(...appliedClasses);

        // Remove the focus class after 1 second
        setTimeout(() => {
          targetElement.classList.remove(...appliedClasses);
        }, 1000);
      }
    });
  }
};

const getRecapVersionStatusStr = (status) => {
  switch (status) {
    case 0:
      return "Bản nháp";
    case 1:
      return "Đang chờ duyệt";
    case 2:
      return "Đã duyệt";
    case 3:
      return "Từ chối";
    case 4:
      return "Superseded";
    default:
      return "Unknown"
  }
}

const MainPanel = () => {
  const { keyIdeas, transcript, review } = useLoaderData();
  const { activeIndex, setActiveIndex } = useRecapVersion();

  return (
    <TabView
      activeIndex={activeIndex}
      onTabChange={(e) => setActiveIndex(e.index)}
      panelContainerClassName="p-0 bg-inherit"
      renderActiveOnly={false}
      pt={{
        nav: 'bg-inherit [&_a]:bg-inherit',
        navContainer: "mb-6",
      }}>
      <TabPanel header="Chi tiết">
        <Suspense fallback={<SuspenseFallback message="Loading key ideas..."/>}>
          <Await
            resolve={keyIdeas}
            errorElement={
              <div className="h-32 flex gap-2 justify-center items-center">
                Error loading key ideas!
              </div>
            }>
            <ListKeyIdeas/>
          </Await>
        </Suspense>
      </TabPanel>
      <TabPanel header="Nhận xét">
        <Suspense fallback={<SuspenseFallback message="Loading review..."/>}>
          <Await resolve={review}>
            {(resolvedReview) => (
              <Await resolve={transcript}>
                <StaffReviews review={resolvedReview}/>
              </Await>
            )}
          </Await>
        </Suspense>
      </TabPanel>
      <TabPanel header="Kiểm tra trùng lặp">
        <Suspense fallback={<SuspenseFallback message="Loading key ideas..."/>}>
          <Await
            resolve={keyIdeas}
            errorElement={
              <div className="h-32 flex gap-2 justify-center items-center">
                Error loading key ideas!
              </div>
            }>
            <PlagiarismCheck/>
          </Await>
        </Suspense>
      </TabPanel>
    </TabView>
  )
}

const RightSidePanel = () => {
  const { review } = useLoaderData();
  const { activeIndex } = useRecapVersion();

  return (
    <div className="border-l border-gray-300 bg-white h-full py-8 px-6 w-[330px]">
      <div className={cn("sticky top-8", { 'hidden': activeIndex !== 0 })}>
        <RecapVersionDetails/>
      </div>

      <div className={cn("sticky top-8", { 'hidden': activeIndex !== 1 })}>
        <Suspense fallback={<SuspenseFallback message="Loading review..."/>}>
          <Await resolve={review}>
            <StaffReviewNotes/>
          </Await>
        </Suspense>
      </div>

      <div className={cn("sticky top-8", { 'hidden': activeIndex !== 2 })}>
        <PlagiarismResults/>
      </div>
    </div>
  )
}

const RecapVersionDetails = () => {
  const { recapVersion, setRecapVersion, isKeyIdeasEmpty } = useRecapVersion();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [ uploadingAudio, setUploadingAudio ] = useState(false);
  const [ updatingName, setUpdatingName ] = useState(false);
  const [ previewDialogVisible, setPreviewDialogVisible ] = useState(false);

  // if recapVersionData.transcriptStatus === 1, then keep polling for the transcript status until it's 2
  useEffect(() => {
    let interval = null;
    const controller = new AbortController();
    let isRequestActive = false; // Flag to track active requests

    if (recapVersion.transcriptStatus === 1) {
      interval = setInterval(async () => {
        if (!isRequestActive) {
          isRequestActive = true;
          try {
            const result = await getRecapVersion(recapVersion.id, controller);

            if (result.transcriptStatus !== 1) {
              setRecapVersion({ ...result });
              clearInterval(interval);
            }
          } catch (error) {
            console.error('Error polling for transcript status:', error);
            showToast({
              severity: 'error',
              summary: 'Error',
              detail: 'Error polling for transcript status. Please try upload audio again.',
            });
            clearInterval(interval);
          } finally {
            isRequestActive = false; // Reset flag after request completes
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      controller.abort(); // Abort any ongoing fetch
    };
  }, [ recapVersion.transcriptStatus ]);

  const handleUploadAudio = async (event) => {
    if (uploadingAudio) return;

    if (event.target.files[0].type !== 'audio/wav') {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Tệp âm thanh phải là tệp .wav',
      });
      return;
    }

    // check if the file is larger than 50MB
    if (event.target.files[0].size > 50 * 1024 * 1024) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Kích thước tập tin phải nhỏ hơn 50MB',
      });
      return;
    }

    try {
      setUploadingAudio(true);
      const formData = new FormData();
      formData.append('audioFile', event.target.files[0]);
      formData.append('recapVersionId', recapVersion.id);
      await axiosInstance.put('/upload-audio', formData);

      const controller = new AbortController();
      const result = await getRecapVersion(recapVersion.id, controller);
      setRecapVersion({ ...result });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Audio uploaded successfully',
      });

    } catch (error) {
      const err = handleFetchError(error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.error,
      });
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (uploadingAudio) return;

    if (isKeyIdeasEmpty) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Không thể tạo audio khi không có ý chính',
      });
      return;
    }

    try {
      setUploadingAudio(true);
      await axiosInstance.put('/generate-audio', {
        recapVersionId: recapVersion.id
      });

      const controller = new AbortController();
      const result = await getRecapVersion(recapVersion.id, controller);
      setRecapVersion({ ...result });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Audio generated successfully',
      });

    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setUploadingAudio(false);
    }
  }

  const handleUpdateName = async () => {
    if (updatingName) return;

    if (!recapVersion.versionName) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Version name cannot be empty',
      });
      return;
    }

    try {
      setUpdatingName(true);
      await axiosInstance2.put('/recap-versions/change-name/' + recapVersion.id, {
        versionName: recapVersion.versionName || ''
      });

      const controller = new AbortController();
      const result = await getRecapVersion(recapVersion.id, controller);
      setRecapVersion({ ...result });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Version name updated successfully',
      });

    } catch (error) {
      console.error('Error updating version name:', error);
    } finally {
      setUpdatingName(false);
    }
  }

  const handleSubmitForReview = async () => {
    if (uploadingAudio || updatingName) return;

    if (!recapVersion.audioURL || !recapVersion.transcriptUrl || recapVersion.transcriptStatus !== 2) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Audio and transcript must be ready before submitting for review',
      });
      return;
    }

    if (!confirm("Are you sure you want to submit this version for review? You won't be able to change this version anymore."))
      return;

    setUploadingAudio(true);
    try {
      const response = await axiosInstance.put('/change-recapversion-status', {
        recapVersionId: recapVersion.id,
        status: 1
      });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Version submitted for review successfully',
      });

      setRecapVersion({ ...response.data.data });
      setUploadingAudio(false);
    } catch (error) {
      setUploadingAudio(false);
      const err = handleFetchError(error);

      console.log("err", err);

      if (err.status === 401) {
        navigate(routes.logout, { replace: true });
      }

      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.error,
      });
    }
  }

  const loading = uploadingAudio || updatingName;

  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Phiên bản tóm tắt</h2>

        <Show when={loading}>
          <div className="flex gap-2 items-center mt-3">
            <div>
              <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                               fill="var(--surface-ground)" animationDuration=".5s"/>
            </div>
            <p>Updating...</p>
          </div>
        </Show>
      </div>
      {/* Version name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tên phiên bản</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tên phiên bản"
            value={recapVersion.versionName || ''}
            onChange={(e) => setRecapVersion((prevData) => ({ ...prevData, versionName: e.target.value }))}
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
          />
          <button
            type="button"
            disabled={loading}
            onClick={handleUpdateName}
            className="px-4 py-2 text-white border bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:opacity-50">
            Lưu&nbsp;tên
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <span className="text-sm font-medium text-gray-700 mr-1">Trạng thái:</span>
        <span className="font-semibold">
            <Badge
              value={getRecapVersionStatusStr(recapVersion.status)}
              // size="large"
              severity={
                recapVersion.status === 0 ? 'warning' :
                  recapVersion.status === 1 ? 'info' :
                    recapVersion.status === 2 ? 'success' :
                      'danger'
              }/>
          </span>
      </div>

      {/* Audio Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Audio:</label>
        <div className="flex items-center space-x-2" key={recapVersion.audioURL}>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none read-only:bg-gray-100"
            defaultValue={recapVersion.audioURL}
            placeholder="Audio URL"
            readOnly
          />
        </div>
      </div>

      <Show when={recapVersion.audioURL}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Audio transcript:</label>
          <div className="flex items-center space-x-2" key={recapVersion.transcriptUrl}>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none read-only:bg-gray-100"
              defaultValue={recapVersion.transcriptUrl}
              placeholder="Audio transcript URL"
              readOnly
            />
          </div>
          <Show when={recapVersion.transcriptStatus === 1} fallback={
            recapVersion.transcriptStatus === 0 ? (
              <p className="text-xs mt-1 text-red-500">
                Transcript generation failed. Please try uploading the audio again.
              </p>
            ) : null
          }>
            <div className="flex gap-2 items-center mt-3">
              <div>
                <ProgressSpinner style={{ width: '15px', height: '15px' }} strokeWidth="8"
                                 fill="var(--surface-ground)" animationDuration=".5s"/>
              </div>
              <p>Generating transcript...</p>
            </div>
          </Show>
        </div>
      </Show>

      <Show when={recapVersion.transcriptUrl && recapVersion.audioURL && recapVersion.transcriptStatus === 2}>
        <>
          <div className="mb-4">
            <button
              type="button"
              className="text-blue-500 hover:underline p-0 text-start"
              onClick={() => setPreviewDialogVisible(true)}
            >
              Xem trước audio và transcript
            </button>
          </div>

          <Dialog
            visible={previewDialogVisible}
            onHide={() => {
              if (!previewDialogVisible) return;
              setPreviewDialogVisible(false);
            }}
            content={({ hide }) => (
              <AudioTranscriptPreview
                hide={hide}
                isOpen={previewDialogVisible}
                audioUrl={recapVersion.audioURL}
                transcriptUrl={recapVersion.transcriptUrl}/>
            )}
          />
        </>
      </Show>

      <Show when={recapVersion.status === 0 && recapVersion.transcriptStatus !== 1}>
        <>
          {/* Generate Audio Button */}
          <div className="mb-2">
            <button
              type="button"
              disabled={loading || isKeyIdeasEmpty}
              onClick={handleGenerateAudio}
              className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300 disabled:opacity-50">
              Tạo audio mới
            </button>
            <p className="block text-sm font-semibold text-gray-500 mt-2 italic">Sử dụng Google Text-to-Speech</p>
          </div>

          <p className="block text-sm text-gray-600 mt-3">Hoặc:</p>
          <div className="mb-4 flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="file"
                accept="audio/wav, .wav"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleUploadAudio}
                disabled={loading || isKeyIdeasEmpty}
              />
              <button
                type="button"
                className="w-full px-4 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-400 focus:outline-none disabled:opacity-50"
                disabled={loading || isKeyIdeasEmpty}
              >
                Tải lên audio
              </button>
            </div>
            <Tooltip target=".tooltipppp" position="left" className="max-w-96"/>
            <div className="tooltipppp text-gray-500"
                 data-pr-tooltip={"Hiện tại, hệ thống chỉ hỗ trợ 1 giọng đọc. Nếu audio có 2 giọng trở lên, hoặc chứa tạp âm thì sẽ ảnh hưởng tới độ chính xác và thời gian chạy của transcript.\n\nTệp âm thanh phải ở định dạng .wav và nhỏ hơn 50MB"}>
              <AiOutlineQuestionCircle size={20}/>
            </div>
          </div>

          <Divider/>
          <div>
            <Show when={isKeyIdeasEmpty}>
              <p className="block text-sm text-red-500 mb-2">Không thể gửi xét duyệt khi không có ý chính</p>
            </Show>
            <button
              type="button"
              disabled={loading || isKeyIdeasEmpty}
              onClick={handleSubmitForReview}
              className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 disabled:opacity-50">
              Gửi xét duyệt
            </button>
          </div>
        </>
      </Show>
    </>
  )
}

const ListKeyIdeas = () => {
  const { keyIdeas, addNewKeyIdea, recapVersion, setActiveIndex } = useRecapVersion();
  const [ openMessage, setOpenMessage ] = useState(true);

  if (!keyIdeas) {
    return null;
  }

  return (
    <div>
      <Message
        severity="warn"
        className="mb-4 !flex !justify-start"
        content={
          <div className={cn("flex gap-2 w-full", {
            "items-center": !openMessage,
            "items-start": openMessage
          })}>
            <div className="w-5">
              <TbExclamationCircle size={20}/>
            </div>
            <div className="flex-1">
              <p><strong>Lưu ý:</strong></p>
              <ul className={cn("list-disc", { "hidden": !openMessage, "ml-4": openMessage })}>
                <li>
                  Sau khi thêm hoặc chỉnh sửa key ideas, nhấn <strong>&#34;Tạo audio
                  mới&#34;</strong> hoặc <strong>&#34;Tải lên audio&#34;</strong> để cập nhật audio và transcript mới
                  nhất.
                </li>
                <li>
                  Không thể chỉnh sửa nội dung sau khi gửi review, chỉ chỉnh sửa được khi nội dung ở trạng
                  thái <strong>&#34;Bản nháp&#34;</strong>.
                </li>
                <li>
                  Hiện tại, hệ thống chỉ hỗ trợ 1 giọng đọc. Nếu audio có 2 giọng trở lên, hoặc chứa tạp âm thì sẽ ảnh
                  hưởng tới độ chính xác và thời gian chạy của transcript.
                </li>
                <li>
                  Nền tảng khuyến khích Contributor chủ động sử dụng tính năng <strong
                  className="hover:text-blue-500 underline" onClick={() => setActiveIndex(2)}>&#34;Kiểm tra trùng
                  lặp&#34;</strong> trước khi gửi xét duyệt. Các bài viết tóm tắt trùng lặp đáng kể với bài viết hiện có
                  có thể bị từ chối.
                </li>
              </ul>
            </div>
            <button
              onClick={() => setOpenMessage(!openMessage)}
              className="hover:text-opacity-80 focus:outline-none"
            >
              {openMessage ? <CgClose size={20}/> : <CgArrowsExpandLeft size={20}/>}
            </button>
          </div>
        }
      />

      {keyIdeas.map((idea) => (
        <KeyIdeaItem
          key={String(idea.id).toLowerCase()}
          keyIdea={idea}
          recapVersionStatus={recapVersion.status}
        />
      ))}

      <Show when={keyIdeas.length === 0}>
        <p className="text-center text-gray-500 mt-4">Chưa có ý chính nào</p>
      </Show>

      <Show when={recapVersion.status === 0}>
        <div className="flex justify-center mt-8">
          <button
            onClick={addNewKeyIdea}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300">
            Thêm ý chính
          </button>
        </div>
      </Show>
    </div>
  )
}

const KeyIdeaItem = ({ keyIdea, recapVersionStatus }) => {
  const { setPlagiarismResults, setKeyIdeaById, removeKeyIdeaById } = useRecapVersion();
  const { showToast } = useToast();
  const [ formData, setFormData ] = useState({
    Title: keyIdea.title,
    Body: keyIdea.body,
    ImageKeyIdea: null,
    Order: keyIdea.order,
    RecapVersionId: keyIdea.recapVersionId
  });
  const imageRef = useRef(null);

  const [ , cancel ] = useDebounce(async () => {
      if (keyIdea.isSaving || recapVersionStatus !== 0) return;
      if (keyIdea.title === formData.Title && keyIdea.body === formData.Body) return;

      await handleSave();
    },
    500, [ formData.Title, formData.Body ]);

  // Save key idea when the image is changed
  useEffect(() => {
    if (!formData.ImageKeyIdea) return;
    handleSave();
    return () => cancel();
  }, [ formData.ImageKeyIdea ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("file", file);
    setFormData((prevData) => ({ ...prevData, ImageKeyIdea: file }));
  };

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove this image?")) return;
    await handleSave(true);
  }

  const handleSave = async (removeImage = false) => {
    if (keyIdea.isSaving || recapVersionStatus !== 0) return;

    if (!formData.RecapVersionId || !formData.Order) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Recap version ID và order không được để trống',
      });
      return;
    }

    if (!formData.Title) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Title không được để trống',
      });
    }

    const formdata = new FormData();

    formdata.append('Title', formData.Title || "");
    formdata.append('Body', formData.Body || "");
    formdata.append('Order', formData.Order);
    formdata.append('RecapVersionId', formData.RecapVersionId);
    formdata.append('RemoveImage', removeImage ? "true" : "false");

    if (formData.ImageKeyIdea) {
      formdata.append('ImageKeyIdea', formData.ImageKeyIdea);

      // change the RemoveImage value to false if a new image is added
      if (removeImage) {
        formdata.set('RemoveImage', 'false');
      }
    } else {
      formdata.append('ImageKeyIdea', new Blob([]), "");
    }

    setFormData((prevData) => ({
      ...prevData,
      ImageKeyIdea: null,
      RemoveImage: false,
    }))

    setKeyIdeaById(keyIdea.id, { isSaving: true });

    try {
      const response = keyIdea.isNewKeyIdea ?
        await axiosInstance.post('/api/keyidea/createkeyidea', formdata) :
        await axiosInstance.put('/api/keyidea/updatekeyidea/' + keyIdea.id, formdata);

      const responseData = response.data.data;

      setKeyIdeaById(keyIdea.id, {
        title: responseData.title,
        body: responseData.body,
        image: responseData.image,
        order: responseData.order,
        recapVersionId: responseData.recapVersionId,
        id: responseData.id,
        isNewKeyIdea: false,
        isSaving: false,
      });
      setPlagiarismResults(null);

    } catch (error) {
      console.error(error);
      const err = handleFetchError(error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.error,
      });

      setKeyIdeaById(keyIdea.id, { isSaving: false });
    }
  }

  const onClickRemoveKeyIdea = async () => {
    if (keyIdea.isSaving || recapVersionStatus !== 0) return;

    const isConfirmed = confirm("Are you sure you want to remove this key idea?");
    if (!isConfirmed) return;

    if (keyIdea.isNewKeyIdea) {
      removeKeyIdeaById(keyIdea.id);
      return;
    }

    setKeyIdeaById(keyIdea.id, { isSaving: true });

    // Delete key idea
    try {
      const response = await axiosInstance.delete('/api/keyidea/delete/' + keyIdea.id);
      console.log(response.data);
      removeKeyIdeaById(keyIdea.id);
      setPlagiarismResults(null);
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Key idea deleted successfully',
      });
    } catch (error) {
      console.error(error);
      const err = handleFetchError(error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.error,
      });

      setKeyIdeaById(keyIdea.id, { isSaving: false });
    }
  }

  return (
    <div className="mb-4 bg-white shadow-sm border border-gray-300 p-4 rounded-md flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          name="Title"
          placeholder="Key idea title"
          disabled={recapVersionStatus !== 0}
          defaultValue={formData.Title || ""}
          onChange={handleInputChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
        />
        <div className="flex-1 text-right">
          {/*<p>Thứ tự: <span className="font-semibold">{keyIdea.order}</span></p>*/}

          <Show when={recapVersionStatus === 0}>
            <button
              type="button"
              className="text-red-500 underline hover:text-red-700"
              tabIndex="-1"
              onClick={onClickRemoveKeyIdea}
              disabled={keyIdea.isSaving || recapVersionStatus !== 0}
            >
              Xóa
            </button>
          </Show>
        </div>
      </div>
      <textarea
        rows="4"
        name="Body"
        placeholder="Key idea details..."
        defaultValue={formData.Body || ""}
        onChange={handleInputChange}
        disabled={recapVersionStatus !== 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      />
      <Show when={keyIdea.image}>
        <div>
          <div className="flex gap-2 items-center mt-3">
            <p className="font-semibold">Hình ảnh:</p>
            <Show when={recapVersionStatus === 0}>
              <button
                type="button"
                onClick={handleRemoveImage}
                tabIndex="-1"
                disabled={keyIdea.isSaving || recapVersionStatus !== 0}
                className="text-red-500 hover:text-red-700 hover:underline"
              >
                (Xóa hình ảnh)
              </button>
            </Show>
          </div>
          <Image src={keyIdea.image || "/empty-image.jpg"} className="hidden" preview ref={imageRef}/>
          <p
            className={cn("cursor-pointer hover:text-blue-500 hover:underline", { "text-gray-500 line-through": formData.RemoveImage })}
            onClick={() => imageRef.current?.show()}
          >
            {keyIdea.image}
          </p>
        </div>
      </Show>
      <Show when={recapVersionStatus === 0}>
        <Show when={!keyIdea.image}>
          <div>
            <p className="font-semibold mt-3">Hình ảnh <span className="font-normal">(nếu có)</span>:</p>
            <div className="flex gap-2 items-center">
              <input
                type="file"
                placeholder="Upload image (optional)"
                accept="image/*"
                name="ImageKeyIdea"
                onChange={handleFileChange}
                disabled={recapVersionStatus !== 0}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          </div>
        </Show>

        <div className="flex justify-end gap-2">
          <div className="flex gap-4 items-center">
            <Show when={keyIdea.isSaving}>
              <div>
                <ProgressSpinner style={{ width: '10px', height: '10px' }} strokeWidth="8"
                                 fill="var(--surface-ground)" animationDuration=".5s"/>
              </div>
            </Show>
            <p className='italic font-semibold text-gray-500'>
              {keyIdea.isNewKeyIdea ? "Chưa lưu" : keyIdea.isSaving ? 'Đang lưu...' :
                <span className="text-green-600">Đã lưu</span>}
            </p>
          </div>
        </div>
      </Show>
    </div>
  )
}

const StaffReviews = ({ review }) => {
  const transcript = useAsyncValue();
  const { recapVersion } = useRecapVersion();
  const [ dialogVisible, setDialogVisible ] = useState(false);

  if (!review) {
    return (
      <div className="h-32 flex gap-2 justify-center items-center">
        <p>No review found</p>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="h-32 flex gap-2 justify-center items-center">
        <p>No transcript found</p>
      </div>
    );
  }

  const reviewNotes = review.reviewNotes || [];

  return (
    <div>
      <CreateAppealDialog
        reviewId={review.id}
        dialogVisible={dialogVisible}
        setDialogVisible={setDialogVisible}
      />

      {/* Only show when recap version got rejected */}
      <Show when={recapVersion.status === 3}>
        <div className="mt-6 flex gap-4 justify-end items-center mb-4">
          <Link
            to={generatePath(routes.reviewAppeals, { reviewId: review.id })}
            className="text-blue-500 hover:underline ml-2"
          >
            Lịch sử đơn kháng cáo
          </Link>
          <button
            className="px-4 py-2 text-white bg-orange-400 rounded-md hover:bg-orange-500 focus:outline-none focus:ring focus:ring-orange-200"
            onClick={() => setDialogVisible(true)}
          >
            Tạo đơn kháng cáo
          </button>
        </div>
      </Show>

      <div>
        {transcript.transcriptSections.map((section, sectionIndex) => {
          return (
            <div
              key={sectionIndex}
              className="mb-4 bg-white shadow-sm border border-gray-300 p-4 rounded-md flex flex-col gap-2"
            >
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {section.title || "(Chưa có tiêu đề)"}
                </h2>
                <p>
                  {section.transcriptSentences.map((sentence) => (
                    <Fragment key={sentence.sentence_index}>
                      <span
                        id={`highlight-${sentence.sentence_index}`}
                        onClick={() => handleClickForHighlight(`note-${sentence.sentence_index}`, [ '!bg-yellow-100' ])}
                        className={cn({
                          'bg-yellow-200 py-0.5 cursor-pointer transition-all hover:bg-yellow-300': reviewNotes.some((note) => Number(note.sentenceIndex) === sentence.sentence_index)
                        })}>{sentence.value.html}</span>{' '}
                    </Fragment>
                  ))}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

const StaffReviewNotes = () => {
  const review = useAsyncValue();
  const reviewNotes = review?.reviewNotes || [];

  if (reviewNotes.length === 0) {
    return (
      <div className="h-32">
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
        <p>No review notes found</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Kết quả xét duyệt</h2>

      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Ghi chú tổng:</h3>
        <div className="w-full italic font-semibold text-gray-500">
          {review.comments}
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-2">Chi tiết:</h3>

        {reviewNotes.map((note) => (
          <div
            key={note.id}
            id={`note-${note.sentenceIndex}`}
            onClick={() => handleClickForHighlight(`highlight-${note.sentenceIndex}`, [ '!bg-red-200' ])}
            className="bg-white shadow-md rounded-lg p-4 mb-4 border border-gray-200 transition-all transform cursor-pointer hover:scale-105"
          >
            <div className="flex justify-between">
              <h3 className="text-md font-bold text-gray-700">{review?.staff?.fullName}</h3>
              <span
                className="text-sm text-gray-500"
              >{note.createdAt ? new Date(note.createdAt + "Z").toLocaleDateString() : 'N/A'}</span>
            </div>
            <p className="text-gray-600 mt-2">{note.feedback}</p>
          </div>
        ))}
      </div>
    </>
  )
}

const PlagiarismCheck = () => {
  const { keyIdeas, plagiarismResults } = useRecapVersion();

  if (!keyIdeas) {
    return null;
  }

  const splitIntoSentences = (text) => {
    return text.split(/(?<=[.!?])\s+/);
  };

  function processKeyIdeasWithGlobalIndices(ideas) {
    let sentenceIndex = 0; // Initialize the global sentence index

    return ideas
      .filter(keyIdea => keyIdea.body) // Filter out key ideas without a body
      .map(keyIdea => {
        // Split the body into sentences and add global indices
        const sentences = splitIntoSentences(keyIdea.body.trim())
          .map(sentence => ({
            sentence_index: sentenceIndex++, // Use and increment the global sentence index
            value: sentence.trim()
          }));

        return {
          title: keyIdea.title,
          body: sentences
        };
      });
  }

  const ideas = processKeyIdeasWithGlobalIndices(keyIdeas);

  return (
    <div>
      <Show when={ideas.length > 0} fallback={
        <p className="text-center text-gray-500 mt-4">No key idea found</p>
      }>
        {ideas.map((idea, idx) => {
          return (
            <div
              key={idx + (idea.title || "title")}
              className="mb-4 bg-white shadow-sm border border-gray-300 p-4 rounded-md flex flex-col gap-2"
            >
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {idea.title || "(Chưa có tiêu đề)"}
                </h2>
                <p>
                  {idea.body.map((sentence) => {
                    const isPlagiarized = plagiarismResults?.plagiarism_results.some((result) => result.sentence_index === sentence.sentence_index);

                    return (
                      <Fragment key={sentence.sentence_index}>
                      <span
                        id={`highlight-plagiarism-${sentence.sentence_index}`}
                        onClick={() => handleClickForHighlight(`card-plagiarism-${sentence.sentence_index}`, [ '!bg-yellow-100' ], true)}
                        className={cn({
                          'bg-yellow-200 py-0.5 cursor-pointer transition-all hover:bg-yellow-300': isPlagiarized
                        })}>{sentence.value}</span>{' '}
                      </Fragment>
                    )
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </Show>
    </div>
  )
}

const PlagiarismResults = () => {
  const { recapVersion, setRecapVersion, plagiarismResults, setPlagiarismResults } = useRecapVersion();
  const [ plagiarismResultsLoading, setPlagiarismResultsLoading ] = useState(false);
  const [ recapVersionInfoLoading, setRecapVersionInfoLoading ] = useState(false);

  useEffect(() => {
    let interval = null;
    const controller = new AbortController();
    let isRequestActive = false;

    if (recapVersion.plagiarismCheckStatus === 1) {
      interval = setInterval(async () => {
        if (!isRequestActive) {
          isRequestActive = true;
          try {
            const result = await getRecapVersion(recapVersion.id, controller);

            if (result.plagiarismCheckStatus !== 1) {
              setRecapVersion(result);
              clearInterval(interval);
            }
          } catch (error) {
            console.error("Error polling for recap version:", error);
            clearInterval(interval);
          } finally {
            isRequestActive = false;
          }
        }
      }, 1000);
    }

    if (recapVersion.plagiarismCheckStatus === 2) fetchPlagiarismResults(controller);

    return () => {
      if (interval) clearInterval(interval);
      controller.abort(); // Abort any ongoing fetch
    };
  }, [ recapVersion.plagiarismCheckStatus ]);

  const fetchPlagiarismResults = async (controller) => {
    setPlagiarismResultsLoading(true);
    const results = await getPlagiarismResults(recapVersion.id, controller);
    setPlagiarismResults(results);
    setPlagiarismResultsLoading(false);
  };

  const onCheckPlagiarism = async () => {
    if (recapVersionInfoLoading || recapVersion.plagiarismCheckStatus === 1)
      return;

    setPlagiarismResultsLoading(true);
    setPlagiarismResults(null);
    await checkPlagiarism(recapVersion.id);

    setRecapVersionInfoLoading(true);
    const controller = new AbortController();
    const data = await getRecapVersion(recapVersion.id, controller);
    setRecapVersion(data);
    setRecapVersionInfoLoading(false);
  };

  function mergePlagiarismResults(data) {
    if (!data) return null;

    const { plagiarism_results, existing_recap_versions_metadata } = data;

    // Create a lookup map for metadata by recap_version_id for efficient access
    const metadataMap = Object.fromEntries(
      existing_recap_versions_metadata.map(meta => [ meta.recap_version_id, meta ])
    );

    // Initialize a counter map to keep track of indices for each existing_recap_version_id
    const indexCounter = {};

    // Merge metadata and add index field for existing_recap_version_id
    return plagiarism_results.map(result => {
      const { existing_recap_version_id } = result;

      // Initialize counter for this existing_recap_version_id if not already set
      if (!indexCounter[existing_recap_version_id]) {
        indexCounter[existing_recap_version_id] = 0;
      }

      // Add the index field based on the current count and increment it
      return {
        ...result,
        same_recap_version_index: indexCounter[existing_recap_version_id]++,
        existing_recap_metadata: metadataMap[existing_recap_version_id] || null
      };
    });
  }

  const plagiResults = useMemo(() => mergePlagiarismResults(plagiarismResults), [ plagiarismResults ]);

  return (
    <>
      <div className="text-center mb-4">
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:opacity-50"
          onClick={onCheckPlagiarism}
          disabled={plagiarismResultsLoading || recapVersionInfoLoading || recapVersion.plagiarismCheckStatus === 1}
        >
          {plagiarismResultsLoading || recapVersionInfoLoading || recapVersion.plagiarismCheckStatus === 1 ? "Đang kiểm tra..." : "Kiểm tra trùng lặp"}
        </button>
      </div>
      <div className="">
        <h2 className="text-2xl font-bold mb-4">Kết quả:</h2>
        {plagiarismResultsLoading || recapVersion.plagiarismCheckStatus === 1 ? (
          <div className="flex gap-2 items-center mt-3">
            <div>
              <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                               fill="var(--surface-ground)" animationDuration=".5s"/>
            </div>
            <p>Loading...</p>
          </div>
        ) : plagiResults ? plagiResults.length === 0 ? (
          <div className="my-4 text-center">
            <p className="text-center">Không phát hiện nội dung trùng lặp</p>
          </div>
        ) : (
          <div className="my-4">
            {plagiResults.map((result, idx) => (
              <div
                key={"card-plagiarism-" + result.sentence_index + "-" + idx}
                id={"card-plagiarism-" + result.sentence_index + "-" + result.same_recap_version_index}
                onClick={() => handleClickForHighlight(`highlight-plagiarism-${result.sentence_index}`, [ '!bg-red-200' ])}
                className={`${"card-plagiarism-" + result.sentence_index} border border-gray-300 p-4 mb-4 rounded-lg bg-gray-50 cursor-pointer`}
              >
                <div className="flex gap-3">
                  <div className="w-1/4 bg-gray-200 rounded-md flex items-center justify-center">
                    <Image
                      src={result.existing_recap_metadata?.book_image || "/empty-image.jpg"}
                      alt={result.existing_recap_metadata?.book_title}
                      className="block overflow-hidden rounded-md shadow-md"
                      imageClassName="aspect-[3/4] object-cover w-full bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg mb-2"><a
                      href={import.meta.env.VITE_AUDIENCE_ENDPOINT + '/recap/' + result.existing_recap_metadata?.recap_id}
                      rel="noopener noreferrer"
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold hover:underline text-indigo-600">{result.existing_recap_metadata?.recap_name}</a>
                    </h3>
                    <p>Của: <span className="font-bold">{result.existing_recap_metadata?.contributor_full_name}</span>
                    </p>
                    <p>Sách: <strong>{result.existing_recap_metadata?.book_title}</strong></p>
                  </div>
                </div>
                <Divider/>
                <blockquote className="italic text-gray-600 my-2">
                  <p>&#34;{result.existing_sentence}&#34;</p>
                </blockquote>
                <div className="bg-gray-200 rounded h-4 my-2 overflow-hidden">
                  <div
                    className={cn("h-full", {
                      "bg-red-300": result.similarity_score >= 0.8,
                      "bg-orange-300": result.similarity_score >= 0.4 && result.similarity_score < 0.8,
                      "bg-green-300": result.similarity_score < 0.4
                    })}
                    style={{ width: `${result.similarity_score * 100}%` }}
                  ></div>
                </div>
                <p
                  className="font-bold text-right">{Number(result.similarity_score * 100).toFixed(1).replace(/(\.0)$/, '')}%</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="my-4 text-center">
            <p>Bài viết chưa được kiểm tra</p>
          </div>
        )}
      </div>
    </>
  )
}

const AudioTranscriptPreview = ({ hide, isOpen, audioUrl, transcriptUrl }) => {
  const [ loading, setLoading ] = useState(false);
  const [ transcript, setTranscript ] = useState(null);
  const [ audioLoaded, setAudioLoaded ] = useState(false);
  const [ selectedTab, setSelectedTab ] = useState("preview");

  useEffect(() => {
    const controller = new AbortController();

    if (isOpen && audioUrl && transcriptUrl) {
      setLoading(true);
      setTranscript(null);
      setAudioLoaded(false);
      fetchTranscript(controller);
    }

    return () => controller.abort();
  }, [ isOpen, audioUrl, transcriptUrl ]);

  useEffect(() => {
    if (audioLoaded && transcript) {
      setLoading(false);
    }
  }, [ audioLoaded, transcript ]);

  const fetchTranscript = async (controller) => {
    try {
      const response = await axios.get(transcriptUrl, {
        signal: controller.signal
      });
      const data = response.data;
      setTranscript(data);
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
  };

  const handleAudioLoaded = () => {
    setAudioLoaded(true);
  };

  return (
    <Modal.Wrapper className="w-screen !max-w-screen-md !min-w-0">
      <Modal.Header
        title="Preview audio and transcript"
        onClose={hide}
        headerTabs={[
          {
            label: "Preview",
            stateName: "preview",
            onClick: () => setSelectedTab("preview")
          },
          {
            label: "Code",
            stateName: "code",
            onClick: () => setSelectedTab("code")
          }
        ]}
        headerTabSelected={selectedTab}
      />
      <Modal.Body className="overflow-y-auto">
        <MediaProvider>
          <div className={cn("h-96 overflow-y-auto p-3 mb-4", {
            "border bg-gray-100 shadow-inner": selectedTab === "code",
          })}>
            <Show when={!loading} fallback={
              <div className="flex gap-2 items-center mt-3">
                <div>
                  <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                                   fill="var(--surface-ground)" animationDuration=".5s"/>
                </div>
                <p>Loading...</p>
              </div>
            }>
              <Show when={transcript} fallback={<p className="text-center text-gray-500">No transcript found</p>}>
              <pre className={cn("leading-relaxed", selectedTab !== "code" && "hidden")}>
                <code>{JSON.stringify(transcript, null, 2)}</code>
              </pre>

                <div className={cn("flex flex-col gap-3 text-lg", selectedTab !== "preview" && "hidden")}>
                  <TranscriptPreviewTab transcriptData={transcript}/>
                </div>
              </Show>
            </Show>
          </div>
          <AudioPlayer
            audioURL={audioUrl}
            handleAudioLoaded={handleAudioLoaded}
            audioLoaded={audioLoaded}
          />
        </MediaProvider>
      </Modal.Body>
      <Modal.Footer className="justify-end gap-3 text-sm">
        <button
          className="bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300"
          type="button"
          onClick={hide}
        >
          Đóng
        </button>
      </Modal.Footer>
    </Modal.Wrapper>
  )
}

const TranscriptPreviewTab = ({ transcriptData }) => {
  const dispatch = useMediaDispatch();
  const currentTime = useMediaSelector(state => state.mediaCurrentTime);

  const [ activeSentenceIndex, setActiveSentenceIndex ] = useState(null);

  // Highlight the corresponded sentence when the audio is playing
  useEffect(() => {
    let found = false;
    for (let sentence of sentences) {
      if (
        isFinite(sentence.start) && isFinite(sentence.end) &&
        currentTime >= sentence.start && currentTime <= sentence.end
      ) {
        // console.log("Highlighting sentence:", currentTime);
        if (activeSentenceIndex !== String(sentence.sentence_index)) setActiveSentenceIndex(String(sentence.sentence_index));
        found = true;
        break;
      }
    }

    if (!found) {
      setActiveSentenceIndex(null);
    }
  }, [ currentTime ]);

  const sentences = useMemo(() => {
    const sents = [];
    transcriptData.transcriptSections.forEach(section => {
      section.transcriptSentences.forEach(sentence => sents.push(sentence))
    })
    return sents;
  }, [ transcriptData ])

  const handleSentenceClick = (startTime) => {
    dispatch({ type: MediaActionTypes.MEDIA_SEEK_REQUEST, detail: parseFloat(startTime) });
  };

  return (
    <>
      {transcriptData.transcriptSections.map((section, index) => (
        <div key={index} className="rounded-lg bg-white shadow-[0px_0px_8px_rgba(0,0,0,0.1)] border">
          {section.image && (
            <div className="relative h-32">
              <Image
                src={section.image}
                alt={section.title || "Section image"}
                className="w-full h-full rounded-t-lg overflow-hidden"
                imageClassName="object-cover w-full h-full"
                preview
              />
            </div>
          )}

          <div className="px-8 py-6">
            {section.title && <h3 className="font-bold text-gray-700 text-xl mb-3.5">{section.title}</h3>}

            {section.transcriptSentences.map((sentence, idx) => {
              const time = sentence.start;
              const sentenceIndex = String(sentence.sentence_index);

              return (
                <Fragment key={idx}>
                  <span
                    id={"sentence-" + index + "-" + idx}
                    data-start={sentence.start}
                    data-end={sentence.end}
                    onClick={() => {
                      if (isFinite(time)) handleSentenceClick(time);
                    }}
                    className={cn("p-0.5 transition-colors cursor-pointer select-none", {
                      "bg-orange-300": activeSentenceIndex === sentenceIndex,
                      "hover:bg-gray-300": activeSentenceIndex !== sentenceIndex
                    })}
                  >{sentence.value.html}</span>
                </Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </>
  )
}

const AudioPlayer = ({ audioURL, handleAudioLoaded, audioLoaded }) => {
  const mediaRef = useMediaRef();
  return (
    <div className="border-t border-gray-300">
      <SvgIcons/>
      <MediaController audio className="@container block max-w-screen-md mx-auto px-5">
        <audio
          slot="media"
          ref={mediaRef}
          src={audioURL}
          onCanPlayThrough={handleAudioLoaded}
          className={cn("w-full", {
            "opacity-50 cursor-progress": !audioLoaded
          })}
        />
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
