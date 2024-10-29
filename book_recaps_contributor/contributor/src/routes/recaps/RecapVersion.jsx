import { axiosInstance, axiosInstance2 } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import { Await, defer, json, useAsyncValue, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/Auth";
import Show from "../../components/Show";
import { cn } from "../../utils/cn";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from 'primereact/divider';
import { routes } from "../../routes";
import { Badge } from "primereact/badge";

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

export const recapVersionLoader = async ({ params, request }) => {
  const recapVersion = await getRecapVersion(params.versionId, request);
  const keyIdeas = getKeyIdeas(params.versionId, request);

  return defer({
    recapVersion,
    keyIdeas
  });
}

const RecapVersion = () => {
  const { recapVersion, keyIdeas } = useLoaderData();
  const [ recapVersionData, setRecapVersionData ] = useState(recapVersion);

  return (
    <div className="relative flex h-full">

      <Suspense
        fallback={<div className="flex-1 text-center">
          <div className="h-32 flex gap-2 justify-center items-center">
            <div>
              <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                               fill="var(--surface-ground)" animationDuration=".5s"/>
            </div>
            <p>Loading key ideas...</p>
          </div>
        </div>}
      >
        <Await
          resolve={keyIdeas}
          errorElement={<div className="flex-1 text-center">
            <div className="h-32 flex gap-2 justify-center items-center">
              Error loading key ideas!
            </div>
          </div>}
        >
          <MainPanel recapVersion={recapVersionData}/>
        </Await>
      </Suspense>
      <RightSidePanel recapVersionData={recapVersionData} setRecapVersionData={setRecapVersionData}/>
    </div>
  );
}

export default RecapVersion;

const MainPanel = ({ recapVersion }) => {
  const keyIdeas = useAsyncValue();
  const [ ideas, setIdeas ] = useState(keyIdeas);
  const { showToast } = useAuth();

  const addNewKeyIdea = () => {
    const highestOrder = ideas.reduce((max, idea) => Math.max(max, idea.order), 0);

    setIdeas([ ...ideas, {
      title: "",
      body: "",
      image: "",
      order: highestOrder + 1,
      recapVersionId: recapVersion.id,
      id: new Date().getTime(),
      isNewKeyIdea: true
    } ]);
  }

  const handleDeleteKeyIdea = async (keyIdea) => {
    if (keyIdea.isNewKeyIdea) {
      setIdeas(ideas.filter(idea => idea.id !== keyIdea.id));
      return;
    }

    // Delete key idea
    try {
      const response = await axiosInstance.delete('/api/keyidea/delete/' + keyIdea.id);
      console.log(response.data);
      setIdeas(ideas.filter(idea => idea.id !== keyIdea.id));
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
    }
  }

  const handleSaveKeyIdea = async (keyIdea, formdata) => {
    try {
      const imageKeyIdea = formdata.get('ImageKeyIdea');
      if (
        imageKeyIdea && imageKeyIdea.size > 0 &&
        formdata.get('RemoveImage') === 'true'
      ) {
        // change the RemoveImage value to false
        formdata.set('RemoveImage', 'false');
      }

      const response = keyIdea.isNewKeyIdea ?
        await axiosInstance.post('/api/keyidea/createkeyidea', formdata) :
        await axiosInstance.put('/api/keyidea/updatekeyidea/' + keyIdea.id, formdata);

      const responseData = response.data.data;
      console.log("keyIdea", responseData);

      setIdeas(ideas.map(idea => {
        if (idea.order === keyIdea.order) {
          return {
            title: responseData.title,
            body: responseData.body,
            image: responseData.image,
            order: responseData.order,
            recapVersionId: responseData.recapVersionId,
            id: responseData.id,
            isNewKeyIdea: false
          };
        }
        return idea;
      }));
    } catch (error) {
      throw handleFetchError(error);
    }
  }

  return (
    <div className="flex-1 py-8 px-6 overflow-y-auto">
      <div className="mb-6 flex items-center space-x-4 border-b pb-4 border-gray-300">
        <img
          src="/empty-image.jpg"
          alt="Book Cover"
          className="w-24 aspect-[3/4] object-cover rounded-md shadow-md"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Title</h1>
          <p className="text-lg text-gray-700">Author Name</p>
        </div>
      </div>

      {/* Key Ideas Section */}
      <div>
        {/* Key Idea Item */}
        {ideas.map((idea) => (
          <KeyIdeaItem
            key={idea.id}
            keyIdea={idea}
            recapVersion={recapVersion}
            handleDeleteKeyIdea={handleDeleteKeyIdea}
            handleSaveKeyIdea={handleSaveKeyIdea}
          />
        ))}

        {/* Add New Key Idea Button */}
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
    </div>
  )
}

const RightSidePanel = ({ recapVersionData, setRecapVersionData }) => {
  const [ loading, setLoading ] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useAuth();

  // if recapVersionData.transcriptStatus === 1, then keep polling for the transcript status until it's 2
  useEffect(() => {
    let interval = null;
    const controller = new AbortController();

    if (recapVersionData.transcriptStatus === 1) {
      interval = setInterval(async () => {
        try {
          const result = await getRecapVersion(recapVersionData.id, controller);
          setRecapVersionData({ ...result });

          if (result.transcriptStatus !== 1) {
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Error polling for transcript status:', error);
          clearInterval(interval); // Optionally stop polling on error
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
      controller.abort(); // Abort any ongoing fetch
    };
  }, [ recapVersionData.transcriptStatus ]);

  const handleUploadAudio = async (event) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('audioFile', event.target.files[0]);
      formData.append('recapVersionId', recapVersionData.id);
      await axiosInstance.put('/upload-audio', formData);

      const controller = new AbortController();
      const result = await getRecapVersion(recapVersionData.id, controller);
      setRecapVersionData({ ...result });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Audio uploaded successfully',
      });

    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    try {
      setLoading(true);
      await axiosInstance.put('/generate-audio', {
        recapVersionId: recapVersionData.id
      });

      const controller = new AbortController();
      const result = await getRecapVersion(recapVersionData.id, controller);
      setRecapVersionData({ ...result });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Audio generated successfully',
      });

    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateName = async () => {
    try {
      setLoading(true);
      await axiosInstance2.put('/recap-versions/change-name/' + recapVersionData.id, {
        versionName: recapVersionData.versionName || ''
      });

      const controller = new AbortController();
      const result = await getRecapVersion(recapVersionData.id, controller);
      setRecapVersionData({ ...result });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Version name updated successfully',
      });

    } catch (error) {
      console.error('Error updating version name:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitForReview = async () => {
    if (!recapVersionData.audioURL || !recapVersionData.transcriptUrl || recapVersionData.transcriptStatus !== 2) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Audio and transcript must be ready before submitting for review',
      });
      return;
    }

    if (!confirm("Are you sure you want to submit this version for review? You won't be able to change this version anymore."))
      return;

    setLoading(true);
    try {
      const request = new AbortController();
      const response = await axiosInstance.put('/change-recapversion-status', {
        recapVersionId: recapVersionData.id,
        status: 1
      }, { signal: request.signal });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Version submitted for review successfully',
      });

      setRecapVersionData({ ...response.data.data });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      const err = handleFetchError(error);

      console.log("err", err);

      if (err.status === 401) {
        navigate(routes.logout, { replace: true });
      }
    }
  }

  const getStatus = (status) => {
    switch (status) {
      case 0:
        return "Draft";
      case 1:
        return "Pending review";
      case 2:
        return "Approved";
      case 3:
        return "Rejected";
      default:
        return "Unknown"
    }
  }

  return (
    <div className="border-l border-gray-300 bg-white h-full py-8 px-6 w-[330px]">
      <div className="sticky top-8">
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
              value={recapVersionData.versionName || ''}
              onChange={(e) => setRecapVersionData({ ...recapVersionData, versionName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              type="button"
              disabled={loading}
              onClick={handleUpdateName}
              className="px-4 py-2 text-white border bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300">
              Save
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700 mr-1">Status:</span>
          <span className="font-semibold">
            <Badge
              value={getStatus(recapVersionData.status)}
              // size="large"
              severity={
                recapVersionData.status === 0 ? 'warning' :
                  recapVersionData.status === 1 ? 'info' :
                    recapVersionData.status === 2 ? 'success' :
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              defaultValue={recapVersionData.audioURL}
              placeholder="Audio URL"
              readOnly
            />
          </div>
        </div>

        <Show when={recapVersionData.audioURL}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Audio transcript:</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                defaultValue={recapVersionData.transcriptUrl}
                placeholder="Audio transcript URL"
                readOnly
              />
            </div>
            <Show when={recapVersionData.transcriptStatus === 1} fallback={
              recapVersionData.transcriptStatus === 0 ? (
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
        <Show when={recapVersionData.status === 0}>
          <>
            {/* Generate Audio Button */}
            <div className="mb-4">
              <button
                type="button"
                disabled={loading}
                onClick={handleGenerateAudio}
                className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300">
                Generate audio
              </button>
              <p className="block text-xs text-gray-500 mt-2">Generate audio using AI (recommended)</p>
              <p className="block text-center text-xs text-gray-500 mt-2">Or</p>
            </div>

            <div className="relative mb-4">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleUploadAudio}
              />
              <button
                type="button"
                className="w-full px-4 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-400 focus:outline-none"
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
                className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300">
                Submit for review
              </button>
            </div>
          </>
        </Show>
      </div>
    </div>
  )
}

const KeyIdeaItem = ({ keyIdea, recapVersion, handleDeleteKeyIdea, handleSaveKeyIdea }) => {
  // const [ isEditing, setIsEditing ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ removeImage, setRemoveImage ] = useState(false);
  const { showToast } = useAuth();
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || recapVersion.status !== 0) return;

    const form = e.target;
    const formData = new FormData(form);

    const title = formData.get('Title');
    const order = formData.get('Order');
    const recapVersionId = formData.get('RecapVersionId');

    if (!recapVersionId || !order) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Recap version ID và order không được để trống',
      });
      return;
    }

    if (!title) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Tiêu đề không được để trống',
      });
      return;
    }

    setLoading(true);
    await handleSaveKeyIdea(keyIdea, formData);
    setLoading(false);
    setRemoveImage(false);
    fileInputRef.current.value = '';
  }

  const onClickDeleteKeyIdea = async () => {
    if (loading || recapVersion.status !== 0) return;

    const isConfirmed = confirm("Are you sure you want to delete this key idea?");
    if (!isConfirmed) return;

    // Delete key idea
    setLoading(true);
    await handleDeleteKeyIdea(keyIdea);
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn({
        "mb-4 bg-white shadow-sm border border-gray-300 p-4 rounded-md flex flex-col gap-2": true,
        "opacity-50 cursor-progress": loading
      })}
    >
      <input type="hidden" name="RemoveImage" value={removeImage ? "true" : "false"}/>
      <input type="hidden" name="Order" defaultValue={keyIdea.order}/>
      <input type="hidden" name="RecapVersionId" defaultValue={keyIdea.recapVersionId}/>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          name="Title"
          placeholder="Key idea title"
          disabled={loading || recapVersion.status !== 0}
          defaultValue={keyIdea.title}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
        />
        <div className="flex-1 text-right">
          <p>Thứ tự: <span className="font-semibold">{keyIdea.order}</span></p>
        </div>
      </div>
      <textarea
        rows="4"
        name="Body"
        placeholder="Key idea details..."
        defaultValue={keyIdea.body}
        disabled={loading || recapVersion.status !== 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      />
      <Show when={keyIdea.image}>
        <div>
          <div className="flex gap-2 items-center">
            <p>Image:</p>
            <Show when={recapVersion.status === 0}>
              (
              <button
                type="button"
                onClick={() => setRemoveImage(!removeImage)}
                disabled={loading || recapVersion.status !== 0}
                className="text-red-500 hover:text-red-700 hover:underline"
              >
                {removeImage ? "Undo" : "Remove"}
              </button>
              )
            </Show>
          </div>
          <p className={cn({ "font-semibold": true, "text-gray-500 line-through": removeImage })}>{keyIdea.image}</p>
        </div>
      </Show>
      <Show when={recapVersion.status === 0}>
        <div className="flex gap-2 items-center">
          <p>Upload new image (optional):</p>
          <input
            type="file"
            placeholder="Upload image (optional)"
            accept="image/*"
            name="ImageKeyIdea"
            disabled={loading || recapVersion.status !== 0}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            ref={fileInputRef}
          />
        </div>
        <div className="flex justify-between gap-4">
          <button
            type="button"
            className="text-red-500 hover:text-red-700"
            onClick={onClickDeleteKeyIdea}
            disabled={loading || recapVersion.status !== 0}
          >
            Delete
          </button>
          <div className="flex gap-4 items-center">
            <p className='italic font-semibold text-gray-500'>
              {keyIdea.isNewKeyIdea ? 'Not saved yet' : loading ? 'Saving...' : 'Saved'}
            </p>
            <button
              type="submit"
              disabled={loading || recapVersion.status !== 0}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              {loading ? 'Loading...' : 'Save'}
            </button>
          </div>
        </div>
      </Show>
    </form>
  )
}