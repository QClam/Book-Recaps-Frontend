import Show from "../../components/Show";
import { ProgressSpinner } from "primereact/progressspinner";
import { useState } from "react";
import { axiosInstance2 } from "../../utils/axios";
import { useAuth } from "../../contexts/Auth";

const RecapDetails = () => {
  return (
    <div className="relative flex h-full">
      <h1>List Recap Versions</h1>
    </div>
  );
}

export default RecapDetails;

const RightSidePanel = ({recapData, setRecapData}) => {
  const [ loading, setLoading ] = useState(false);
  const { showToast } = useAuth();

  const handleUpdateName = async () => {
    // try {
    //   setLoading(true);
    //   await axiosInstance2.put('/recap/change-name/' + recapData.id, {
    //     name: recapData.name || ''
    //   });
    //
    //   const controller = new AbortController();
    //   const result = await getRecap(recapData.id, controller);
    //   setRecapData({ ...result });
    //
    //   showToast({
    //     severity: 'success',
    //     summary: 'Success',
    //     detail: 'Recap name updated successfully',
    //   });
    //
    // } catch (error) {
    //   console.error('Error updating name:', error);
    // } finally {
    //   setLoading(false);
    // }
  }

  return (
    <div className="border-l border-gray-300 bg-white h-full py-8 px-6 w-[330px]">
      <div className="sticky top-8">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Recap</h2>

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

        {/* Recap name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Recap name"
              value={recapData.name || ''}
              onChange={(e) => setRecapData({ ...recapData, name: e.target.value })}
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
      </div>
    </div>
  );
}