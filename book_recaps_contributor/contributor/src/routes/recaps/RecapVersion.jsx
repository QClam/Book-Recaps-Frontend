import { axiosInstance, axiosInstance2 } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import { Await, defer, json, useAsyncValue, useLoaderData, useNavigate } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import Show from "../../components/Show";
import { cn } from "../../utils/cn";
import { ProgressSpinner } from "primereact/progressspinner";
import { Divider } from 'primereact/divider';
import { routes } from "../../routes";
import { Badge } from "primereact/badge";
import { useToast } from "../../contexts/Toast";
import { getBookInfoByRecap } from "../fetch";
import CustomBreadCrumb from "../../components/CustomBreadCrumb";
import { useDebounce } from "react-use";

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
  const bookInfo = getBookInfoByRecap(params.recapId, request);

  return defer({
    recapVersion,
    keyIdeas,
    bookInfo
  });
}

const RecapVersion = () => {
  const { recapVersion, keyIdeas, bookInfo } = useLoaderData();
  const [ recapVersionData, setRecapVersionData ] = useState(recapVersion);

  return (
    <div className="relative flex h-full">

      {/* Main panel */}
      <div className="flex-1 pb-8 px-6 overflow-y-auto">
        <CustomBreadCrumb items={[
          { label: "Recaps", path: routes.recaps },
          { label: "Recap details", path: routes.recaps + "/" + recapVersionData.recapId },
          { label: recapVersionData.versionName || "Version details" }
        ]}/>

        <Suspense
          fallback={
            <div className="h-32 flex gap-2 justify-center items-center">
              <div>
                <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                                 fill="var(--surface-ground)" animationDuration=".5s"/>
              </div>
              <p>Loading book information...</p>
            </div>
          }>
          <Await resolve={bookInfo} errorElement={
            <div className="h-14 flex gap-2 justify-center items-center italic font-semibold text-gray-400">
              Error loading book info!
            </div>
          }>
            <BookInfo/>
          </Await>
        </Suspense>

        <Suspense
          fallback={
            <div className="h-32 flex gap-2 justify-center items-center">
              <div>
                <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                                 fill="var(--surface-ground)" animationDuration=".5s"/>
              </div>
              <p>Loading key ideas...</p>
            </div>
          }>
          <Await
            resolve={keyIdeas}
            errorElement={
              <div className="h-32 flex gap-2 justify-center items-center">
                Error loading key ideas!
              </div>
            }>
            <ListKeyIdeas recapVersion={recapVersionData}/>
          </Await>
        </Suspense>
      </div>

      <RightSidePanel recapVersionData={recapVersionData} setRecapVersionData={setRecapVersionData}/>
    </div>
  );
}

export default RecapVersion;

const RightSidePanel = ({ recapVersionData, setRecapVersionData }) => {
  const [ uploadingAudio, setUploadingAudio ] = useState(false);
  const [ updatingName, setUpdatingName ] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // if recapVersionData.transcriptStatus === 1, then keep polling for the transcript status until it's 2
  useEffect(() => {
    let interval = null;
    const controller = new AbortController();
    let isRequestActive = false; // Flag to track active requests

    if (recapVersionData.transcriptStatus === 1) {
      interval = setInterval(async () => {
        if (!isRequestActive) {
          isRequestActive = true;
          try {
            const result = await getRecapVersion(recapVersionData.id, controller);

            if (result.transcriptStatus !== 1) {
              setRecapVersionData(ver => ({
                ...ver,
                transcriptStatus: result.transcriptStatus,
                transcriptUrl: result.transcriptUrl
              }));
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
  }, [ recapVersionData.transcriptStatus ]);

  const handleUploadAudio = async (event) => {
    if (uploadingAudio) return;

    try {
      setUploadingAudio(true);
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
      setUploadingAudio(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (uploadingAudio) return;

    try {
      setUploadingAudio(true);
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
      setUploadingAudio(false);
    }
  }

  const handleUpdateName = async () => {
    if (updatingName) return;

    try {
      setUpdatingName(true);
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
      setUpdatingName(false);
    }
  }

  const handleSubmitForReview = async () => {
    if (uploadingAudio || updatingName) return;

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

    setUploadingAudio(true);
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
      case 4:
        return "Superseded";
      default:
        return "Unknown"
    }
  }

  const loading = uploadingAudio || updatingName;

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
        <Show when={recapVersionData.status === 0 && recapVersionData.transcriptStatus !== 1}>
          <>
            {/* Generate Audio Button */}
            <div className="mb-4">
              <button
                type="button"
                disabled={loading}
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
      </div>
    </div>
  )
}

const BookInfo = () => {
  const bookInfo = useAsyncValue();

  return (
    <div className="mb-6 flex items-center gap-4 border-b pb-4 border-gray-300">
      <img
        src={bookInfo.coverImage || "/empty-image.jpg"}
        alt="Book Cover"
        className="w-24 aspect-[3/4] object-cover rounded-md shadow-md"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          currentTarget.src = "/empty-image.jpg";
        }}
      />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{bookInfo.title}</h1>
        <p className="text-lg text-gray-700">
          <span className="font-semibold text-black">Tác giả: </span>
          <span>{bookInfo.authors.map((author) => author.name).join(", ")}</span>
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold text-black">Thể loại: </span>
          <span>{bookInfo.categories.map((cate) => cate.name).join(", ")}</span>
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold text-black">Năm xuất bản: </span>
          <span>{bookInfo.publicationYear}</span>
        </p>
      </div>
    </div>
  )
}

const ListKeyIdeas = ({ recapVersion }) => {
  const keyIdeas = useAsyncValue();
  const [ ideas, setIdeas ] = useState(keyIdeas.map(idea => ({
    title: idea.title,
    body: idea.body,
    image: idea.image,
    order: idea.order,
    recapVersionId: idea.recapVersionId,
    id: idea.id,
    isNewKeyIdea: false,
    isSaving: false
  })));
  const { showToast } = useToast();

  const addNewKeyIdea = () => {
    const highestOrder = ideas.reduce((max, idea) => Math.max(max, idea.order), 0);

    setIdeas([ ...ideas, {
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

  const handleDeleteKeyIdea = async (keyIdea) => {
    if (keyIdea.isNewKeyIdea) {
      setIdeas(ideas.filter(idea => idea.id !== keyIdea.id));
      return;
    }

    setIdeas((prevIdeas) => prevIdeas.map(idea =>
      idea.id === keyIdea.id ? { ...idea, isSaving: true } : idea
    ));

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

      setIdeas((prevIdeas) => prevIdeas.map(idea =>
        idea.id === keyIdea.id ? { ...idea, isSaving: false } : idea
      ));
    }
  }

  const handleSaveKeyIdea = async (keyIdea, formdata) => {
    setIdeas((prevIdeas) => prevIdeas.map(idea =>
      idea.id === keyIdea.id ? { ...idea, isSaving: true } : idea
    ));

    try {
      const response = keyIdea.isNewKeyIdea ?
        await axiosInstance.post('/api/keyidea/createkeyidea', formdata) :
        await axiosInstance.put('/api/keyidea/updatekeyidea/' + keyIdea.id, formdata);

      const responseData = response.data.data;

      setIdeas((prevIdeas) => prevIdeas.map(idea =>
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

    } catch (error) {
      console.error(error);
      const err = handleFetchError(error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.error,
      });

      setIdeas((prevIdeas) => prevIdeas.map(idea =>
        idea.id === keyIdea.id ? { ...idea, isSaving: false } : idea
      ));
    }
  }

  return (
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

      {/* No Key Idea */}
      <Show when={ideas.length === 0}>
        <p className="text-center text-gray-500 mt-4">No key idea found</p>
      </Show>

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
  )
}

const KeyIdeaItem = ({ keyIdea, recapVersion, handleDeleteKeyIdea, handleSaveKeyIdea }) => {
  const [ formData, setFormData ] = useState({
    Title: keyIdea.title,
    Body: keyIdea.body,
    ImageKeyIdea: null,
    Order: keyIdea.order,
    RecapVersionId: keyIdea.recapVersionId
  });
  const { showToast } = useToast();

  const [ , cancel ] = useDebounce(async () => {
      if (keyIdea.isSaving || recapVersion.status !== 0) return;

      if (keyIdea.title === formData.Title && keyIdea.body === formData.Body) return;

      await handleSave();
    },
    2000,
    [ formData.Title, formData.Body ]
  );

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
    if (keyIdea.isSaving || recapVersion.status !== 0) return;

    if (!formData.RecapVersionId || !formData.Order) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Recap version ID và order không được để trống',
      });
      return;
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

    await handleSaveKeyIdea(keyIdea, formdata);
    setFormData({
      ...formData,
      ImageKeyIdea: null,
      RemoveImage: false,
    })
  }

  const onClickRemoveKeyIdea = async () => {
    if (keyIdea.isSaving || recapVersion.status !== 0) return;

    const isConfirmed = confirm("Are you sure you want to remove this key idea?");
    if (!isConfirmed) return;

    await handleDeleteKeyIdea(keyIdea);
  }

  return (
    <div
      className={cn({
        "mb-4 bg-white shadow-sm border border-gray-300 p-4 rounded-md flex flex-col gap-2": true,
        "opacity-50 cursor-progress": keyIdea.isSaving
      })}
    >
      <div className="flex gap-2 items-center">
        <input
          type="text"
          name="Title"
          placeholder="Key idea title"
          disabled={recapVersion.status !== 0}
          value={formData.Title || ""}
          onChange={handleInputChange}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
        />
        <div className="flex-1 text-right">
          {/*<p>Thứ tự: <span className="font-semibold">{keyIdea.order}</span></p>*/}

          <button
            type="button"
            className="text-red-500 hover:text-red-700"
            onClick={onClickRemoveKeyIdea}
            disabled={keyIdea.isSaving || recapVersion.status !== 0}
          >
            Remove
          </button>
        </div>
      </div>
      <textarea
        rows="4"
        name="Body"
        placeholder="Key idea details..."
        value={formData.Body || ""}
        onChange={handleInputChange}
        disabled={recapVersion.status !== 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      />
      <Show when={keyIdea.image}>
        <div>
          <div className="flex gap-2 items-center">
            <p className="font-semibold mt-3">Image:</p>
            <Show when={recapVersion.status === 0}>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={keyIdea.isSaving || recapVersion.status !== 0}
                className="text-red-500 hover:text-red-700 hover:underline"
              >
                (Remove)
              </button>
            </Show>
          </div>
          <p className={cn({
            "font-semibold": true,
            "text-gray-500 line-through": formData.RemoveImage
          })}>
            {keyIdea.image}
          </p>
        </div>
      </Show>
      <Show when={recapVersion.status === 0}>
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
                disabled={keyIdea.isSaving || recapVersion.status !== 0}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          </div>
        </Show>

        <div className="flex justify-end gap-2">
          <div className="flex gap-4 items-center">
            <Show when={keyIdea.isSaving}>
              <ProgressSpinner style={{ width: '15px', height: '15px' }} strokeWidth="8"
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