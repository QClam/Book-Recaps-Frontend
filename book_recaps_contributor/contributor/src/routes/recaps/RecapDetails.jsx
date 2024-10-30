import Show from "../../components/Show";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  Await,
  defer,
  Form,
  json,
  Link,
  redirect,
  useActionData,
  useAsyncValue,
  useLoaderData,
  useNavigate,
  useNavigation
} from "react-router-dom";
import { getBookInfoByRecap } from "../fetch";
import { axiosInstance, axiosInstance2 } from "../../utils/axios";
import { handleFetchError } from "../../utils/handleFetchError";
import { routes } from "../../routes";
import { Suspense, useEffect, useState } from "react";
import { Badge } from "primereact/badge";
import { InputSwitch } from "primereact/inputswitch";
import { useToast } from "../../contexts/Toast";
import CustomBreadCrumb from "../../components/CustomBreadCrumb";
import { TbPlus } from "react-icons/tb";
import { Dialog } from "primereact/dialog";
import TextInput from "../../components/form/TextInput";
import { cn } from "../../utils/cn";

const getRecapInfo = async (recapId, request) => {
  try {
    const response = await axiosInstance2.get('/recaps/' + recapId, {
      signal: request.signal
    });
    return response.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

const getRecapVersions = async (recapId, request) => {
  try {
    const response = await axiosInstance2.get('/recap-versions/by-recap/' + recapId, {
      signal: request.signal
    });
    return response.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const recapDetailsLoader = async ({ params, request }) => {
  const recap = await getRecapInfo(params.recapId, request);
  const recapVersions = getRecapVersions(params.recapId, request);
  const bookInfo = getBookInfoByRecap(params.recapId, request);

  return defer({
    recapVersions,
    recap,
    bookInfo
  });
}

export async function recapDetailsAction({ request, params }) {
  if (request.method.toLowerCase() === 'put') {
    const formData = await request.formData();
    const isPremium = formData.get('isPremium') === 'on';
    const isPublished = formData.get('isPublished') === 'on';
    const name = formData.get('name');

    try {
      const response = await axiosInstance2.put('/recaps/' + params.recapId, {
        name, isPublished, isPremium
      });

      return {
        data: response.data,
        success: true,
        method: 'put'
      };
    } catch (error) {
      const err = handleFetchError(error);
      console.log("err", err);

      if (err.status === 401) {
        return redirect(routes.logout);
      }
      return err;
    }
  }

  // Create new version
  const formData = await request.formData();
  const recapId = formData.get('recapId');
  const contributorId = formData.get('userId');
  const versionName = formData.get('name');

  if (!recapId || !contributorId || !versionName) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  try {
    const response = await axiosInstance.post('/api/recap/create-version', {
      recapId, contributorId, versionName
    });

    return {
      data: response.data.data,
      success: true,
      method: 'post'
    }
  } catch (error) {
    const err = handleFetchError(error);
    console.log("err", err);

    if (err.status === 401) {
      return redirect(routes.logout);
    }
    return err;
  }
}

const RecapDetails = () => {
  const { recapVersions, bookInfo, recap } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation()
  const navigate = useNavigate();
  const [ dialogVisible, setDialogVisible ] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (actionData?.error) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: actionData.error,
      });

      if (dialogVisible) setDialogVisible(false);
    }
    if (actionData?.success && actionData.method === 'post') {
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Version created successfully',
      });

      setDialogVisible(false);

      navigate(`/recaps/${recap.id}/version/${actionData.data.id}`);
    }
  }, [ actionData ]);

  return (
    <div className="relative flex h-full">
      <Dialog
        visible={dialogVisible}
        modal
        onHide={() => {
          if (!dialogVisible) return;
          setDialogVisible(false);
        }}
        content={({ hide }) => (
          <Form className="flex flex-col py-4 px-5 gap-1 bg-white rounded" method="post">
            <input type="hidden" name="recapId" value={recap.id}/>
            <input type="hidden" name="userId" value={recap.userId}/>
            <TextInput
              id="name"
              label="Version name:"
              name="name"
              placeholder="Tên version"
              required
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                className={cn({
                  "text-white bg-indigo-600 rounded py-2 px-4 border font-medium hover:bg-indigo-700": true,
                  "opacity-50 cursor-not-allowed": navigation.state === "loading"
                })}
                type="submit"
                disabled={navigation.state === "submitting"}
              >
                {navigation.state === "loading" ? "Loading..." : "Tạo"}
              </button>

              <button
                className={cn({
                  "text-white bg-gray-200 rounded py-2 px-4 border font-medium hover:bg-gray-300": true,
                  "opacity-50 cursor-not-allowed": navigation.state === "loading"
                })}
                type="button"
                onClick={hide}
                disabled={navigation.state === "submitting"}
              >
                Hủy
              </button>
            </div>
          </Form>
        )}
      />
      <div className="flex-1 pb-8 px-6 overflow-y-auto">
        <CustomBreadCrumb
          items={[ { label: "Recaps", path: routes.recaps }, { label: recap.name || "Recap details" } ]}/>

        <Suspense>
          <Await resolve={bookInfo} errorElement={
            <div className="h-14 flex gap-2 justify-center items-center italic font-semibold text-gray-400">
              Error loading book info!
            </div>
          }>
            <BookInfo/>
          </Await>
        </Suspense>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="flex justify-center items-center gap-1 px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800"
            onClick={() => setDialogVisible(true)}
          >
            <TbPlus/>
            <span>
              Tạo version mới
            </span>
          </button>
        </div>

        <Suspense
          fallback={
            <div className="h-32 flex gap-2 justify-center items-center">
              <div>
                <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                                 fill="var(--surface-ground)" animationDuration=".5s"/>
              </div>
              <p>Loading versions...</p>
            </div>
          }>
          <Await
            resolve={recapVersions}
            errorElement={
              <div className="h-32 flex gap-2 justify-center items-center">
                Error loading versions!
              </div>
            }>
            <ListRecapVersions/>
          </Await>
        </Suspense>
      </div>

      <RightSidePanel/>
    </div>
  );
}

export default RecapDetails;

const BookInfo = () => {
  const bookInfo = useAsyncValue();

  return (
    <div className="mb-4 flex items-center gap-4 border-b pb-4 border-gray-300">
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

const ListRecapVersions = () => {
  const recapVersions = useAsyncValue();

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

  return (
    <div className="flex flex-col border border-gray-200 rounded overflow-x-auto shadow-sm">
      <table className="min-w-full table-fixed">
        <thead className="bg-[#f8fafc] text-left">
        <tr>
          <th scope="col"
              className="pl-[18px] px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]">
            Tên version
          </th>
          <th scope="col"
              className="px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
              style={{ borderLeft: "1px dashed #d5dce6" }}>
            Version number
          </th>
          <th scope="col"
              className="px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
              style={{ borderLeft: "1px dashed #d5dce6" }}>
            Trạng thái
          </th>
          <th scope="col"
              className="px-2.5 py-[8.7px] font-medium text-[#637286] tracking-wider border-[#e2e7ee] border-b leading-6 shadow-[0_-10px_0_white]"
              style={{ borderLeft: "1px dashed #d5dce6" }}>
            Hành động
          </th>
        </tr>
        </thead>
        <tbody>
        {recapVersions.map((version) => (
          <tr key={version.id} className="hover:bg-gray-100 odd:bg-white even:bg-gray-50 text-[#333c48]">
            <td className="px-2.5 py-1 pl-[18px] font-semibold border-[#e2e7ee] border-b">
              <div className="min-w-60">
                <Link
                  to={`/recaps/${version.recapId}/version/${version.id}`}
                  className="min-w-full line-clamp-2 break-words hover:underline text-indigo-500"
                >
                  {version.versionName || <span className="italic">(Chưa có tên)</span>}
                </Link>
              </div>
            </td>
            <td className="px-2.5 py-3 border-[#e2e7ee] border-b" style={{ borderLeft: "1px dashed #d5dce6" }}>
              {version.versionNumber}
            </td>
            <td className="px-2.5 py-3 border-[#e2e7ee] border-b" style={{ borderLeft: "1px dashed #d5dce6" }}>
              <Badge
                value={getStatus(version.status)}
                severity={
                  version.status === 0 ? 'warning' :
                    version.status === 1 ? 'info' :
                      version.status === 2 ? 'success' :
                        'danger'
                }/>
            </td>
            <td className="px-2.5 py-3 border-[#e2e7ee] border-b" style={{ borderLeft: "1px dashed #d5dce6" }}>
              ...
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

const RightSidePanel = () => {
  const { recap } = useLoaderData();
  const [ recapData, setRecapData ] = useState(recap);
  const actionData = useActionData();
  const navigation = useNavigation();
  const { showToast } = useToast();

  const loading = navigation.state === 'submitting';

  useEffect(() => {
    if (actionData?.success && actionData.method === 'put') {
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Recap updated successfully',
      });

      setRecapData(actionData.data);
    }
  }, [ actionData ]);

  return (
    <div className="border-l border-gray-300 bg-white h-full py-8 px-6 w-[330px]">
      <Form className="sticky top-8 flex flex-col gap-5" method="put">
        <div>
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
        <div>
          <label className="block font-medium text-gray-700 mb-1">Name</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Recap name"
              name="name"
              value={recapData.name || ''}
              onChange={(e) => setRecapData({ ...recapData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Recap status */}
        <div className="flex items-center gap-3">
          <p className="font-medium text-gray-700 mr-1">Status:</p>
          <div className="font-semibold flex items-center">
            <Badge
              value={recapData.isPublished ? 'Published' : 'Private'}
              severity={recapData.isPublished ? 'success' : 'danger'}
            />
          </div>
          <InputSwitch checked={recapData.isPublished}
                       onChange={(e) => setRecapData({ ...recapData, isPublished: e.value })}
                       name="isPublished"/>
        </div>

        {/*  Premium*/}
        <div className="flex items-center gap-3">
          <p className="font-medium text-gray-700 mr-1">Premium:</p>
          <div className="font-semibold flex items-center">
            <Badge
              value={recapData.isPremium ? 'True' : 'False'}
              severity={recapData.isPremium ? 'success' : 'danger'}
            />
          </div>
          <InputSwitch checked={recapData.isPremium}
                       onChange={(e) => setRecapData({ ...recapData, isPremium: e.value })}
                       name="isPremium"/>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md font-medium disabled:bg-gray-300 hover:bg-blue-700"
          >
            Update
          </button>
        </div>

      </Form>
    </div>
  );
}