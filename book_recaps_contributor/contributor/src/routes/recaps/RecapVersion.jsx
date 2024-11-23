import { Await, defer, generatePath, json, Link, useAsyncValue, useLoaderData, useNavigate } from "react-router-dom";
import { Fragment, Suspense, useEffect, useMemo, useState } from "react";
import { useDebounce } from "react-use";
import { TabPanel, TabView } from 'primereact/tabview';
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from 'primereact/divider';
import { Badge } from "primereact/badge";
import { Dialog } from "primereact/dialog";

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
import { useAuth } from "../../contexts/Auth";
import TextArea from "../../components/form/TextArea";
import BookInfo from "../../components/BookInfo";
import axios from "axios";

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

export const recapVersionLoader = async ({ params, request }) => {
  const recapVersion = await getRecapVersion(params.versionId, request);
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
              {(book) => <BookInfo book={book}/>}
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

const handleClickForHighlight = (targetId, appliedClasses = []) => {
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    targetElement.classList.add(...appliedClasses); // Add the focus class for animation
    setTimeout(() => {
      targetElement.classList.remove(...appliedClasses); // Remove the focus class after 1s
    }, 1000);
  }
}

const getRecapVersionStatusStr = (status) => {
  switch (status) {
    case 0:
      return "Draft";
    case 1:
      return "Pending review";
    case 2:
      return "Approved";
    case 3:
      return "Rejected";
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
      <TabPanel header="Kiểm tra đạo văn">
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

      <div className={cn({ 'hidden': activeIndex !== 1 })}>
        <Suspense fallback={<SuspenseFallback message="Loading review..."/>}>
          <Await resolve={review}>
            <StaffReviewNotes/>
          </Await>
        </Suspense>
      </div>

      <div className={cn({ 'hidden': activeIndex !== 2 })}>
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
      }, 1500);
    }

    return () => {
      if (interval) clearInterval(interval);
      controller.abort(); // Abort any ongoing fetch
    };
  }, [ recapVersion.transcriptStatus ]);

  const handleUploadAudio = async (event) => {
    if (uploadingAudio) return;

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
        detail: 'Key ideas cannot be empty',
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
    }
  }

  const loading = uploadingAudio || updatingName;

  return (
    <>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Recap Version</h2>

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
        <label className="block text-sm font-medium text-gray-700 mb-1">Version name</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Version name"
            value={recapVersion.versionName || ''}
            onChange={(e) => setRecapVersion((prevData) => ({ ...prevData, versionName: e.target.value }))}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
          />
          <button
            type="button"
            disabled={loading}
            onClick={handleUpdateName}
            className="px-4 py-2 text-white border bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:opacity-50">
            Save
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <span className="text-sm font-medium text-gray-700 mr-1">Status:</span>
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
        <div className="flex items-center space-x-2">
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none read-only:bg-gray-100"
            value={recapVersion.audioURL}
            placeholder="Audio URL"
            readOnly
          />
        </div>
      </div>

      <Show when={recapVersion.audioURL}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Audio transcript:</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none read-only:bg-gray-100"
              value={recapVersion.transcriptUrl}
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
              Preview audio and transcript
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
          <div className="mb-4">
            <button
              type="button"
              disabled={loading || isKeyIdeasEmpty}
              onClick={handleGenerateAudio}
              className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300 disabled:opacity-50">
              Generate audio
            </button>
            <p className="block text-xs text-gray-500 mt-2">Generate audio using AI (recommended)</p>
            <p className="block text-center text-xs text-gray-500 mt-2">Or</p>
          </div>

          <div className="relative mb-4">
            <input
              type="file"
              accept="audio/wav, .wav"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleUploadAudio}
            />
            <button
              type="button"
              className="w-full px-4 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-400 focus:outline-none disabled:opacity-50"
              disabled={loading}
            >
              Upload audio
            </button>
          </div>

          <Divider/>
          <div>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmitForReview}
              className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 disabled:opacity-50">
              Submit for review
            </button>
          </div>
        </>
      </Show>
    </>
  )
}

const ListKeyIdeas = () => {
  const { keyIdeas, setKeyIdeas, recapVersion } = useRecapVersion();

  if (!keyIdeas) {
    return null;
  }

  const addNewKeyIdea = () => {
    const highestOrder = keyIdeas.reduce((max, idea) => Math.max(max, idea.order), 0);

    setKeyIdeas((prevIdeas) => [ ...prevIdeas, {
      title: "",
      body: "",
      image: "",
      order: highestOrder + 1,
      recapVersionId: recapVersion.id,
      id: new Date().getTime(),
      isNewKeyIdea: true,
      isSaving: false
    } ]);
  }

  return (
    <div>
      {keyIdeas.map((idea) => (
        <KeyIdeaItem
          key={idea.id}
          keyIdea={idea}
          recapVersionStatus={recapVersion.status}
        />
      ))}

      <Show when={keyIdeas.length === 0}>
        <p className="text-center text-gray-500 mt-4">No key idea found</p>
      </Show>

      <Show when={recapVersion.status === 0}>
        <div className="flex justify-center mt-8">
          <button
            onClick={addNewKeyIdea}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300">
            Add new key idea
          </button>
        </div>
      </Show>
    </div>
  )
}

const KeyIdeaItem = ({ keyIdea, recapVersionStatus }) => {
  const { setKeyIdeas, setPlagiarismResults } = useRecapVersion();
  const { showToast } = useToast();
  const [ formData, setFormData ] = useState({
    Title: keyIdea.title,
    Body: keyIdea.body,
    ImageKeyIdea: null,
    Order: keyIdea.order,
    RecapVersionId: keyIdea.recapVersionId
  });

  const [ , cancel ] = useDebounce(async () => {
      if (keyIdea.isSaving || recapVersionStatus !== 0) return;
      if (keyIdea.title === formData.Title && keyIdea.body === formData.Body) return;

      await handleSave();
    },
    2000, [ formData.Title, formData.Body ]);

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

    setFormData({
      ...formData,
      ImageKeyIdea: null,
      RemoveImage: false,
    })

    setKeyIdeas((prevIdeas) => prevIdeas.map(idea =>
      idea.id === keyIdea.id ? { ...idea, isSaving: true } : idea
    ));

    try {
      const response = keyIdea.isNewKeyIdea ?
        await axiosInstance.post('/api/keyidea/createkeyidea', formdata) :
        await axiosInstance.put('/api/keyidea/updatekeyidea/' + keyIdea.id, formdata);

      const responseData = response.data.data;

      setKeyIdeas((prevIdeas) => prevIdeas.map(idea =>
        idea.id === keyIdea.id ? ({
          title: responseData.title,
          body: responseData.body,
          image: responseData.image,
          order: responseData.order,
          recapVersionId: responseData.recapVersionId,
          id: responseData.id,
          isNewKeyIdea: false,
          isSaving: false
        }) : idea
      ));
      setPlagiarismResults(null);

    } catch (error) {
      console.error(error);
      const err = handleFetchError(error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.error,
      });

      setKeyIdeas((prevIdeas) => prevIdeas.map(idea =>
        idea.id === keyIdea.id ? { ...idea, isSaving: false } : idea
      ));
    }
  }

  const onClickRemoveKeyIdea = async () => {
    if (keyIdea.isSaving || recapVersionStatus !== 0) return;

    const isConfirmed = confirm("Are you sure you want to remove this key idea?");
    if (!isConfirmed) return;

    if (keyIdea.isNewKeyIdea) {
      setKeyIdeas((prevIdeas) => prevIdeas.filter(idea => idea.id !== keyIdea.id));
      return;
    }

    setKeyIdeas((prevIdeas) => prevIdeas.map(idea =>
      idea.id === keyIdea.id ? { ...idea, isSaving: true } : idea
    ));

    // Delete key idea
    try {
      const response = await axiosInstance.delete('/api/keyidea/delete/' + keyIdea.id);
      console.log(response.data);
      setKeyIdeas((prevIdeas) => prevIdeas.filter(idea => idea.id !== keyIdea.id));
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

      setKeyIdeas((prevIdeas) => prevIdeas.map(idea =>
        idea.id === keyIdea.id ? { ...idea, isSaving: false } : idea
      ));
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
              className="text-red-500 hover:text-red-700"
              tabIndex="-1"
              onClick={onClickRemoveKeyIdea}
              disabled={keyIdea.isSaving || recapVersionStatus !== 0}
            >
              Remove
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
            <p className="font-semibold">Image:</p>
            <Show when={recapVersionStatus === 0}>
              <button
                type="button"
                onClick={handleRemoveImage}
                tabIndex="-1"
                disabled={keyIdea.isSaving || recapVersionStatus !== 0}
                className="text-red-500 hover:text-red-700 hover:underline"
              >
                (Remove)
              </button>
            </Show>
          </div>
          <p className={cn({
            "text-gray-500 line-through": formData.RemoveImage
          })}>
            {keyIdea.image}
          </p>
        </div>
      </Show>
      <Show when={recapVersionStatus === 0}>
        <Show when={!keyIdea.image}>
          <div>
            <p className="font-semibold mt-3">Image <span className="font-normal">(optional)</span>:</p>
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
              <ProgressSpinner style={{ width: '10px', height: '10px' }} strokeWidth="8"
                               fill="var(--surface-ground)" animationDuration=".5s"/>
            </Show>
            <p className='italic font-semibold text-gray-500'>
              {keyIdea.isNewKeyIdea ? 'Not saved yet' : keyIdea.isSaving ? 'Saving...' : 'Saved'}
            </p>
          </div>
        </div>
      </Show>
    </div>
  )
}

const CreateAppealDialog = ({ dialogVisible, setDialogVisible, reviewId }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [ reason, setReason ] = useState('');
  const [ isCreatingAppeal, setIsCreatingAppeal ] = useState(false);

  const onCreateAppeal = async () => {
    if (isCreatingAppeal) return;
    if (!reason) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Vui lòng nhập nội dung kháng cáo',
      });
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn tạo đơn kháng cáo?")) return;

    setIsCreatingAppeal(true);
    try {
      await axiosInstance.post('/api/appeal/createappeal', {
        reviewId,
        contributorId: user.id,
        reason
      });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Đơn kháng cáo đã được tạo thành công',
      });

      setDialogVisible(false);
      setIsCreatingAppeal(false);
    } catch (error) {
      console.error(error);
      const err = handleFetchError(error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.error,
      });

      setIsCreatingAppeal(false);
    }
  }
  return (
    <Dialog
      visible={dialogVisible}
      onHide={() => {
        if (!dialogVisible) return;
        setDialogVisible(false);
        setReason('');
      }}
      content={({ hide }) => (
        <Modal.Wrapper>
          <Modal.Header title="Tạo đơn kháng cáo" onClose={hide}/>
          <Modal.Body className="pb-0">
            <div className="flex flex-col gap-1">
              <TextArea
                id="reason"
                label="Nội dung:"
                name="reason"
                placeholder="Nội dung đơn"
                required
                onKeyPress={(e) => e.key === 'Enter' && onCreateAppeal()}
                onChange={(e) => setReason(e.target.value)}
                disabled={isCreatingAppeal}
              />
              <Modal.Footer className="-mx-5 mt-5 justify-end gap-3 text-sm">
                <button
                  className={cn({
                    "bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300": true,
                    "opacity-50 cursor-not-allowed": isCreatingAppeal
                  })}
                  type="button"
                  onClick={hide}
                  disabled={isCreatingAppeal}
                >
                  Hủy
                </button>

                <button
                  className={cn({
                    "text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700": true,
                    "opacity-50 cursor-not-allowed": isCreatingAppeal
                  })}
                  type="button"
                  disabled={isCreatingAppeal}
                  onClick={onCreateAppeal}
                >
                  {isCreatingAppeal ? "Loading..." : "Gửi"}
                </button>
              </Modal.Footer>
            </div>
          </Modal.Body>
        </Modal.Wrapper>
      )}
    />
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
    <div className="">
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
              >{note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <p className="text-gray-600 mt-2">{note.feedback}</p>
          </div>
        ))}
      </div>
    </div>
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
                        onClick={() => handleClickForHighlight(`card-plagiarism-${sentence.sentence_index}-0`, [ '!bg-yellow-100' ])}
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
      }, 1500);
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
    <div>
      <div className="text-center mb-4">
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:opacity-50"
          onClick={onCheckPlagiarism}
          disabled={plagiarismResultsLoading || recapVersionInfoLoading || recapVersion.plagiarismCheckStatus === 1}
        >
          {plagiarismResultsLoading || recapVersionInfoLoading || recapVersion.plagiarismCheckStatus === 1 ? "Đang kiểm tra..." : "Kiểm tra đạo văn"}
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
            <p className="text-center">Không phát hiện vi phạm</p>
          </div>
        ) : (
          <div className="my-4">
            {plagiResults.map((result, idx) => (
              <div
                key={"card-plagiarism-" + result.sentence_index + "-" + idx}
                id={"card-plagiarism-" + result.sentence_index + "-" + result.same_recap_version_index}
                onClick={() => handleClickForHighlight(`highlight-plagiarism-${result.sentence_index}`, [ '!bg-red-200' ])}
                className="border border-gray-300 p-4 mb-4 rounded-lg bg-gray-50 cursor-pointer"
              >
                <h3 className="text-lg mb-2">{result.existing_recap_metadata?.book_title}</h3>
                <p>Bài viết của: <span
                  className="font-bold">{result.existing_recap_metadata?.contributor_full_name}</span></p>
                <blockquote className="italic text-gray-600 my-2">
                  <p>&#34;{result.existing_sentence}&#34;</p>
                </blockquote>
                <div className="bg-gray-200 rounded h-4 my-2 overflow-hidden">
                  <div className="h-full bg-red-300" style={{ width: `${result.similarity_score * 100}%` }}></div>
                </div>
                <p className="font-bold text-right">${Number(result.similarity_score * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="my-4 text-center">
            <p>Bài viết chưa được kiểm tra</p>
          </div>
        )}
      </div>
    </div>
  )
}

const AudioTranscriptPreview = ({ hide, isOpen, audioUrl, transcriptUrl }) => {
  const [ loading, setLoading ] = useState(false);
  const [ transcript, setTranscript ] = useState(null);
  const [ audioLoaded, setAudioLoaded ] = useState(false);

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
    <Modal.Wrapper className="w-screen max-w-screen-sm">
      <Modal.Header title="Preview audio and transcript" onClose={hide}/>
      <Modal.Body className="">
        <div className="h-96 overflow-y-auto border p-3 mb-4 bg-gray-100 shadow-inner">
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
              <pre className="leading-relaxed">
                <code>{JSON.stringify(transcript, null, 2)}</code>
              </pre>
            </Show>
          </Show>

        </div>
        <audio controls onCanPlayThrough={handleAudioLoaded} className={cn("w-full", {
          "opacity-50 cursor-progress": !audioLoaded
        })}>
          <source src={audioUrl} type={audioUrl.endsWith(".wav") ? "audio/wav" : "audio/mp4"}/>
          Your browser does not support the audio element.
        </audio>
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