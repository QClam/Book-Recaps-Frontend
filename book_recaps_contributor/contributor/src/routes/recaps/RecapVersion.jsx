import { axiosInstance, axiosInstance2 } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import { json, useLoaderData } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/Auth";
import Show from "../../components/Show";
import { cn } from "../../utils/cn";

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
  const keyIdeas = await getKeyIdeas(params.versionId, request);

  return {
    recapVersion,
    keyIdeas
  };
}

const RecapVersion = () => {
  return (
    <div className="relative flex h-full">
      <MainPanel/>
      <RightSidePanel/>
    </div>
  );
}

export default RecapVersion;

const MainPanel = () => {
  const { recapVersion, keyIdeas } = useLoaderData();
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
      if (keyIdea.isNewKeyIdea) {
        const response = await axiosInstance.post('/api/keyidea/createkeyidea', formdata);
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
      } else {
        console.log("update key idea");
      }
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
            handleDeleteKeyIdea={handleDeleteKeyIdea}
            handleSaveKeyIdea={handleSaveKeyIdea}
          />
        ))}

        {/* Add New Key Idea Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={addNewKeyIdea}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300">
            Add new key idea
          </button>
        </div>
      </div>
    </div>
  )
}

const RightSidePanel = () => {
  const { recapVersion } = useLoaderData();

  const getStatus = (status) => {
    switch (status) {
      case 1:
        return "Draft";
      case 2:
        return "Pending";
      case 3:
        return "Approved";
      case 4:
        return "Rejected";
      default:
        return "Unknown"
    }
  }

  return (
    <div className="border-l border-gray-300 bg-white h-full py-8 px-6">
      <div className="sticky top-8">
        {/* Version name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Version name</label>
          <input
            type="text"
            defaultValue={recapVersion.versionName}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <span className="block text-sm font-medium text-gray-700 mb-1">Status:</span>
          <span className="block text-lg font-semibold text-gray-900">
            {getStatus(recapVersion.status)}
          </span>
        </div>

        {/* Audio Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Audio:</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              defaultValue={recapVersion.audioURL}
              placeholder="Audio URL"
              readOnly
            />
          </div>
        </div>

        <div className="mb-4">
          <button
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300">
            Upload audio
          </button>
          <p className="block text-center text-xs text-gray-500 mt-2">Or</p>
        </div>
        {/* Generate Audio Button */}
        <div className="mb-4">
          <button
            className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300">
            Generate audio
          </button>
          <span className="block text-xs text-gray-500 mt-2">Generate audio using AI (recommended)</span>
        </div>

        {/* Submit for review */}
        <div>
          <button
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300">
            Submit for review
          </button>
        </div>
      </div>
    </div>
  )
}

const KeyIdeaItem = ({ keyIdea, handleDeleteKeyIdea, handleSaveKeyIdea }) => {
  // const [ isEditing, setIsEditing ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const { showToast } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // const id = formData.get('id');
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
  }

  const onClickDeleteKeyIdea = async () => {
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
      <input type="hidden" name="Id" defaultValue={keyIdea.id}/>
      <input type="hidden" name="Order" defaultValue={keyIdea.order}/>
      <input type="hidden" name="RecapVersionId" defaultValue={keyIdea.recapVersionId}/>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          name="Title"
          placeholder="Key idea title"
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
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      />
      <Show when={keyIdea.image}>
        <div className="flex gap-2 items-center">
          <p>Image:</p>
          <p className="font-semibold">{keyIdea.image}</p>
        </div>
      </Show>
      <div className="flex gap-2 items-center">
        <p>Upload new image (optional):</p>
        <input
          type="file"
          placeholder="Upload image (optional)"
          accept="image/*"
          name="ImageKeyIdea"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>
      <div className="flex justify-between gap-4">
        <button
          type="button"
          className="text-red-500 hover:text-red-700"
          onClick={onClickDeleteKeyIdea}
          disabled={loading}
        >
          Delete
        </button>
        <div className="flex gap-4 items-center">
          <p className='italic font-semibold text-gray-500'>
            {keyIdea.isNewKeyIdea ? 'Not saved yet' : 'Saved'}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            {loading ? 'Loading...' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  )
}