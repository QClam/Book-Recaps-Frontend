import Show from "../../components/Show";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  Await,
  defer,
  Form,
  generatePath,
  json,
  Link,
  Navigate,
  redirect,
  useActionData,
  useAsyncValue,
  useLoaderData,
  useNavigation,
  useSubmit
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
import { TbPlus, TbTrash } from "react-icons/tb";
import { Dialog } from "primereact/dialog";
import TextInput from "../../components/form/TextInput";
import { cn } from "../../utils/cn";
import Modal from "../../components/modal";
import Table from "../../components/table";
import BookInfo from "../../components/BookInfo";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import _ from "lodash";

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

const getRecapStats = async (recapId, fromDate, toDate, request) => {
  try {
    const response = await axiosInstance.get('/api/recap/getrecapdetail/' + recapId, {
      params: { fromDate, toDate },
      signal: request.signal
    });
    return response.data.data;
  } catch (error) {
    const err = handleFetchError(error);
    console.log("err", err);
    return null;
  }
}

const updateRecap = async (recapId, request) => {
  const formData = await request.formData();

  const isPremium = formData.get('isPremium') === 'true';
  const isPublished = formData.get('isPublished') === 'true';
  const name = formData.get('name');
  const currentVersionId = formData.get('currentVersionId') || null;

  if (!name) {
    return { error: "Vui lòng điền tên recap", method: 'put' };
  }

  try {
    const response = await axiosInstance2.put('/recaps/' + recapId, {
      name, isPublished, isPremium, currentVersionId
    }, {
      signal: request.signal
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
    return { ...err, method: 'put' };
  }
}

const createRecapVersion = async (request) => {
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
    }, {
      signal: request.signal
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

const deleteVersionFromPlagiarismDB = async (versionId) => {
  try {
    const response = await axiosInstance2.delete('/plagiarism/delete-recap-version/' + versionId);
    return response.data;
  } catch (error) {
    return handleFetchError(error);
  }
}

const deleteVersion = async (request) => {
  const formData = await request.formData();

  const versionId = formData.get('versionId');
  const isCurrent = formData.get('isCurrent') === 'true';
  const isRecapPublished = formData.get('isRecapPublished') === 'true';
  const versionStatus = formData.get('versionStatus');

  if (!versionId) {
    return { error: "Version id not found." };
  }

  if (isCurrent && isRecapPublished) {
    return { error: "Cannot delete current version of a published recap." };
  }

  try {
    const response = await axiosInstance.delete('/api/recap/softdeleteversion/' + versionId, {
      signal: request.signal
    });

    if (Number(versionStatus) === 2) {
      deleteVersionFromPlagiarismDB(versionId).then()
    }

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

export const recapDetailsLoader = async ({ params, request }) => {
  const recap = await getRecapInfo(params.recapId, request);
  const recapVersions = getRecapVersions(params.recapId, request);
  const bookInfo = getBookInfoByRecap(params.recapId, request);

  return defer({
    recapVersions,
    recap,
    bookInfo,
  });
}

export async function recapDetailsAction({ request, params }) {
  switch (request.method) {
    case 'PUT':
      return await updateRecap(params.recapId, request);
    case 'POST':
      return await createRecapVersion(request);
    case 'DELETE':
      return await deleteVersion(request);
    default:
      return null;
  }
}

const RecapDetails = () => {
  const { recapVersions, bookInfo, recap } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation()
  const { showToast } = useToast();
  const [ dialogVisible, setDialogVisible ] = useState(false);
  const [ activeTab, setActiveTab ] = useState('versions');

  useEffect(() => {
    if (actionData?.error && actionData.method !== 'put') {
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
    }
  }, [ actionData ]);

  if (actionData?.success && actionData.method === 'post') {
    return <Navigate to={generatePath(routes.recapVersionDetails, {
      // recapId: recap.id,
      versionId: actionData.data.id
    })}/>
  }

  return (
    <div className="relative flex h-full">
      <Dialog
        visible={dialogVisible}
        onHide={() => {
          if (!dialogVisible) return;
          setDialogVisible(false);
        }}
        content={({ hide }) => (
          <Modal.Wrapper>
            <Modal.Header title="Tạo phiên bản bài viết mới" onClose={(e) => hide(e)}/>
            <Modal.Body className="pb-0">
              <Form className="flex flex-col gap-1" method="post">
                <input type="hidden" name="recapId" value={recap.id}/>
                <input type="hidden" name="userId" value={recap.userId}/>
                <TextInput
                  id="name"
                  label="Tên phiên bản:"
                  name="name"
                  placeholder="Tên phiên bản mới"
                  required
                />
                <Modal.Footer className="-mx-5 mt-5 justify-end gap-3 text-sm">
                  <button
                    className={cn({
                      "bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300": true,
                      "opacity-50 cursor-not-allowed": navigation.state === "loading"
                    })}
                    type="button"
                    onClick={hide}
                    disabled={navigation.state === "submitting"}
                  >
                    Hủy
                  </button>

                  <button
                    className={cn({
                      "text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700": true,
                      "opacity-50 cursor-not-allowed": navigation.state === "loading"
                    })}
                    type="submit"
                    disabled={navigation.state === "submitting"}
                  >
                    {navigation.state === "loading" ? "Loading..." : "Tạo"}
                  </button>
                </Modal.Footer>
              </Form>
            </Modal.Body>
          </Modal.Wrapper>
        )}
      />
      <div className="flex-1 pb-8 px-6 overflow-y-auto">
        <CustomBreadCrumb
          items={[ { label: "Recaps", path: routes.recaps }, { label: recap.name || "Recap details" } ]}/>

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
            {(book) => <BookInfo book={book}/>}
          </Await>
        </Suspense>

        <div className="my-4 flex justify-between">
          <div className="flex gap-3 items-center">
            <button
              type="button"
              className="flex justify-center items-center gap-1 px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800 disabled:cursor-default disabled:opacity-50 disabled:!bg-gray-600"
              onClick={() => setActiveTab('versions')}
              disabled={activeTab === 'versions'}
            >
              Versions
            </button>
            <button
              type="button"
              className="flex justify-center items-center gap-1 px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800 disabled:cursor-default disabled:opacity-50 disabled:!bg-gray-600"
              onClick={() => setActiveTab('income')}
              disabled={activeTab === 'income'}
            >
              Thu nhập
            </button>
          </div>

          <button
            type="button"
            className="flex justify-center items-center gap-1 px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800"
            onClick={() => setDialogVisible(true)}
          >
            <TbPlus/>
            <span>Tạo version mới</span>
          </button>
        </div>

        <div className={cn({ "hidden": activeTab !== 'versions' })}>
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

        <div className={cn({ "hidden": activeTab !== 'income' })}>
          <RecapVersionStats/>
        </div>
      </div>

      <RightSidePanel/>
    </div>
  );
}

export default RecapDetails;

const ListRecapVersions = () => {
  const { recap } = useLoaderData();
  const recapVersions = useAsyncValue();
  const navigation = useNavigation();
  const submit = useSubmit();

  const getStatusStr = (status) => {
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
    <Table.Container>
      <Table.Head columns={[
        'Tên version',
        'Version number',
        'Trạng thái',
        'Ngày tạo',
        'Ngày cập nhật',
        ''
      ]}/>
      <Table.Body
        when={recapVersions.length > 0}
        fallback={
          <tr>
            <Table.Cell colSpan="100" className="h-32 text-center">
              <div className="flex gap-2 justify-center items-center">
                <p>No versions found!</p>
              </div>
            </Table.Cell>
          </tr>
        }
      >
        {recapVersions.map((version) => {
          const isCurrent = version.id === recap.currentVersionId;

          return (
            <Table.Row key={version.id}>
              <Table.Cell isFirstCell={true}>
                <div className="min-w-60 relative">
                  <Link
                    to={generatePath(routes.recapVersionDetails, {
                      // recapId: version.recapId,
                      versionId: version.id
                    })}
                    className="min-w-full line-clamp-2 break-words hover:underline text-indigo-500 font-semibold"
                  >
                    {version.versionName || <span className="italic">(Chưa đặt tên)</span>}
                  </Link>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center gap-4">
                  <span>{version.versionNumber}</span>
                  {isCurrent && (
                    <span className="bg-yellow-400 text-xs font-semibold rounded-full px-2 py-1">Current</span>
                  )}
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  value={getStatusStr(version.status)}
                  severity={
                    version.status === 0 ? 'warning' :
                      version.status === 1 ? 'info' :
                        version.status === 2 ? 'success' :
                          'danger'
                  }/>
              </Table.Cell>
              <Table.Cell>{version.createdAt ? new Date(version.createdAt).toLocaleDateString() : 'N/A'}</Table.Cell>
              <Table.Cell>{version.updatedAt ? new Date(version.updatedAt).toLocaleDateString() : 'N/A'}</Table.Cell>
              <Table.Cell>
                <Form method="delete" onSubmit={(e) => {
                  e.preventDefault();
                  if (confirm("Are you sure you want to delete this version?")) {
                    submit(e.currentTarget, { method: "delete" });
                  }
                }}>
                  <input type="hidden" name="versionId" value={version.id}/>
                  <input type="hidden" name="versionStatus" value={version.status}/>
                  <input type="hidden" name="isCurrent" value={isCurrent.toString()}/>
                  <input type="hidden" name="isRecapPublished" value={recap.isPublished.toString()}/>
                  <button
                    className="border rounded p-1 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-progress"
                    type="submit"
                    title="Delete version"
                    disabled={navigation.state === 'submitting' || navigation.state === 'loading'}
                  >
                    <span className="text-lg"><TbTrash/></span>
                  </button>
                </Form>
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table.Container>
  );
}

const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const RecapVersionStats = () => {
  const { recap } = useLoaderData();
  const [ fromDate, setFromDate ] = useState(oneWeekAgo.toISOString().split('T')[0]);
  const [ toDate, setToDate ] = useState(new Date().toISOString().split('T')[0]);
  const [ stats, setStats ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ activeTab, setActiveTab ] = useState('views');
  const [ controller, setController ] = useState(null);

  useEffect(() => {
    return () => controller?.abort();
  }, [ controller ]);

  useEffect(() => {
    applyDateFilter()
  }, []);

  const applyDateFilter = async () => {
    // Convert dates to UTC format before sending to the backend
    const newController = new AbortController();

    setLoading(true);
    setController(newController);

    const data = await getRecapStats(recap.id, fromDate, toDate, newController);

    setStats(data);
    setLoading(false);
  };
  const dashboardData = stats ? stats.dailyStats.$values.map((item) => ({
    date: item.date.split('T')[0],
    views: item.views,
    watchTime: item.watchTime,
    earning: item.earning
  })) : [];

  const color = {
    stroke: {
      views: "#82ca9d",
      watchTime: "#8884d8",
      earning: "#f0ad4e"
    },
    fill: {
      views: "url(#colorViews)",
      watchTime: "url(#colorWatchTime)",
      earning: "url(#colorEarning)"
    },
    name: {
      views: "Views",
      watchTime: "Watch time",
      earning: "Earning"
    }
  }

  return (
    <div className={cn("p-4 bg-white rounded-lg shadow-md", { "cursor-progress": loading })}>
      <div className="flex justify-between mb-4 gap-4">
        <div className="flex-1 py-4 px-6 rounded-md shadow-sm space-y-1 border border-gray-300">
          <div className="text-lg font-semibold">
            Tổng lượt xem
          </div>
          <p className="text-sm italic text-gray-500">
            (All time)
          </p>
          <p className="text-2xl font-bold text-indigo-600">
            {recap.viewsCount || 0} views
          </p>
        </div>
        <div className="flex-1 py-4 px-6 rounded-md shadow-sm space-y-1 border border-gray-300">
          <div className="text-lg font-semibold">
            Quyết toán gần nhất
          </div>
          <Show when={!loading} fallback={<p>Loading...</p>}>
            <Show when={stats && stats.lastPayout} fallback={<p>Chưa có quyết toán nào.</p>}>
              <p className="text-sm italic text-gray-500">
                (Từ {new Date(stats?.lastPayout?.fromDate).toLocaleDateString()} đến {new Date(stats?.lastPayout?.toDate).toLocaleDateString()})
              </p>
              <p className="text-2xl font-bold text-indigo-600">
                {stats?.lastPayout?.amount.toLocaleString("vi-VN")} VNĐ
              </p>
            </Show>
          </Show>
        </div>
      </div>

      <div className="flex gap-4 mb-4 justify-end">
        <div className="flex items-center gap-4">
          <label className="block mb-1 font-semibold">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="block mb-1 font-semibold">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
          />
        </div>
        <button
          onClick={applyDateFilter}
          className="px-4 py-2 bg-blue-500 font-semibold text-white rounded-md"
        >
          Apply
        </button>
      </div>

      <div className="flex justify-between gap-3 text-center mb-4">
        <button
          className={cn("flex-1 rounded-md bg-gray-100", {
            "bg-blue-500 text-white py-3": activeTab === 'views',
          })}
          onClick={() => setActiveTab('views')}
        >
          <div className="text-2xl font-bold">1000</div>
          <div>Views</div>
        </button>
        <button
          className={cn("flex-1 rounded-md bg-gray-100", {
            "bg-blue-500 text-white py-3": activeTab === 'watchTime',
          })}
          onClick={() => setActiveTab('watchTime')}
        >
          <div className="text-2xl font-bold">4000</div>
          <div>Watch time (minutes)</div>
        </button>
        <button
          className={cn("flex-1 rounded-md bg-gray-100", {
            "bg-blue-500 text-white py-3": activeTab === 'earning',
          })}
          onClick={() => setActiveTab('earning')}
        >
          <div className="text-2xl font-bold">2.000.000</div>
          <div>Earning (VNĐ)</div>
        </button>
      </div>

      <div>
        <ResponsiveContainer width="100%" height={430} aspect={16 / 9}>
          <AreaChart data={dashboardData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWatchTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f0ad4e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f0ad4e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date"/>
            <YAxis/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{
              bottom: -10,
              width: '100%',
            }}/>
            <Area
              type="monotone"
              fillOpacity={1}
              dataKey={activeTab}
              stroke={color.stroke[activeTab]}
              fill={color.fill[activeTab]}
              name={color.name[activeTab]}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const RightSidePanel = () => {
  const { recap, recapVersions } = useLoaderData();
  const [ recapData, setRecapData ] = useState(recap);
  const actionData = useActionData();
  const navigation = useNavigation();
  const { showToast } = useToast();

  const loading = navigation.state === 'submitting' && navigation.formMethod === 'put';

  useEffect(() => {
    if (actionData?.success && actionData.method === 'put') {
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Recap updated successfully',
      });

      setRecapData(actionData.data);
    }
    if (actionData?.error && actionData.method === 'put') {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: actionData.error,
      });

      setRecapData(recap);
    }
  }, [ actionData ]);

  useEffect(() => {
    !_.isEqual(recap, recapData) && setRecapData(recap);
  }, [ recap ]);

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
              required
              value={recapData.name || ''}
              onChange={(e) => setRecapData({ ...recapData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 read-only:bg-gray-100"
              readOnly={loading || recap.isPublished}
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
            <input type="hidden" name="isPublished" value={recapData.isPublished}/>
          </div>
          <InputSwitch checked={recapData.isPublished}
                       onChange={(e) => setRecapData({ ...recapData, isPublished: e.value })}
                       disabled={loading}/>
        </div>

        {/*  Premium*/}
        <div className="flex items-center gap-3">
          <p className="font-medium text-gray-700 mr-1">Premium:</p>
          <div className="font-semibold flex items-center">
            <Badge
              value={recapData.isPremium ? 'True' : 'False'}
              severity={recapData.isPremium ? 'success' : 'danger'}
            />
            <input type="hidden" name="isPremium" value={recapData.isPremium}/>
          </div>
          <InputSwitch checked={recapData.isPremium}
                       onChange={(e) => setRecapData({ ...recapData, isPremium: e.value })}
                       disabled={loading || recap.isPublished}/>
        </div>

        {/* Current Version */}

        <div>
          <label className="block font-medium text-gray-700 mb-1">Current version:</label>
          <input type="hidden" name="currentVersionId" value={recapData.currentVersionId || ''}/>
          <div className="flex items-center gap-2">
            <Suspense
              fallback={
                <div className="flex gap-2 items-center">
                  <div>
                    <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                                     fill="var(--surface-ground)" animationDuration=".5s"/>
                  </div>
                  <p>Loading versions...</p>
                </div>
              }>
              <Await resolve={recapVersions} errorElement={
                <div className="flex gap-2 items-center">
                  <p>Error loading versions!</p>
                </div>
              }>
                {(versions) => (
                  <select
                    value={recapData.currentVersionId || ''}
                    onChange={(e) => setRecapData({ ...recapData, currentVersionId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
                    disabled={loading || recap.isPublished}
                  >
                    <option value="">Select version</option>
                    {versions.map((version) => (
                      <option
                        key={version.id}
                        value={version.id}
                      >
                        {version.versionNumber} - {version.versionName || "(Chưa đặt tên)"}
                      </option>
                    ))}
                  </select>
                )}
              </Await>
            </Suspense>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading || navigation.state === 'loading'}
            className="w-full bg-blue-500 text-white py-2 rounded-md font-medium disabled:bg-gray-300 hover:bg-blue-700"
          >
            Update
          </button>
        </div>

      </Form>
    </div>
  );
}