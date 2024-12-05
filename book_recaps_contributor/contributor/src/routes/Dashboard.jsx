import CustomBreadCrumb from "../components/CustomBreadCrumb";
import { Divider } from "primereact/divider";
import { defer, generatePath, json, Link, useLoaderData } from "react-router-dom";
import { routes } from "../routes";
import { Fragment } from "react";
import Show from "../components/Show";
import { axiosInstance } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import { getCurrentUserInfo } from "../utils/getCurrentUserInfo";
import { Image } from "primereact/image";

const getDashboardData = async (request) => {
  try {
    const user = getCurrentUserInfo()
    const response = await axiosInstance.get('/api/dashboard/contributordashboard/' + user.id, {
      signal: request.signal
    });
    return response.data.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const dashboardLoader = async ({ request }) => {
  const data = await getDashboardData(request);

  return defer({ data });
}

const Dashboard = () => {
  const { data } = useLoaderData();
  console.log(data.recaps.$values.length);

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Dashboard" } ]}/>

      {/* Performance Overview Section */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Thu nhập chưa quyết toán</div>
          <div className="text-2xl font-bold mb-2">
            {Number(data.totalIncome).toLocaleString("vi-VN")} VNĐ
          </div>
          <div>
            <div className="text-sm text-gray-500">Quyết toán gần nhất</div>
            <div className="flex items-center justify-between gap-3">
              <p>{Number(data.lastPayoutAmount).toLocaleString("vi-VN")} VNĐ</p>
              <i className="pi pi-chart-line text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Lượt xem</div>
          <div className="text-2xl font-bold mb-2">{data.newViewCount} views</div>
          <div>
            <div className="text-sm text-gray-500">Tháng trước</div>
            <div className="flex items-center justify-between gap-3">
              <p>{data.oldViewCount} views</p>
              <i className="pi pi-eye text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Số bài viết mới</div>
          <div className="text-2xl font-bold mb-2">{data.newRecapsCount} bài viết</div>
          <div>
            <div className="text-sm text-gray-500">Tháng trước</div>
            <div className="flex items-center justify-between gap-3">
              <p>{data.oldRecapsCount} bài viết</p>
              <i className="pi pi-file text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Số dư hiện tại</div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-2xl font-bold mb-2">{Number(data.currentEarnings).toLocaleString("vi-VN")} VNĐ</div>
            <i className="pi pi-wallet text-gray-500 text-2xl"></i>
          </div>
          <Divider/>
          <div className="flex items-center justify-end">
            <Link to={routes.earningWithdrawals} className="font-semibold text-indigo-600 hover:underline">
              Lịch sử rút tiền
            </Link>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        {/* Published Recaps Section */}
        <div className="flex-1">
          <div className="relative flex justify-between items-center mb-4">
            <div className="text-xl font-semibold">Published recaps</div>
            <Link to={routes.recaps} className="bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-md absolute right-0 bottom-0">
              All recaps
            </Link>
          </div>
          <div className="space-y-4 bg-white rounded-md border border-gray-300 p-2">
            <Show when={data.recaps.$values.length > 0} fallback={
              <div className="text-center text-gray-500">No recaps found</div>
            }>
              {data.recaps.$values.slice(0, 4).map((recap, index) => (
                <Fragment key={index}>
                  <Show when={index !== 0}>
                    <Divider/>
                  </Show>
                  <Link to={generatePath(routes.recapDetails, {recapId: recap.recapId})} className="flex gap-4 p-5 hover:bg-gray-100">
                    <div className="w-20 bg-gray-200 rounded-md flex items-center justify-center">
                      <Image
                        src={recap.bookImage || "/empty-image.jpg"}
                        alt={recap.bookName}
                        className="block overflow-hidden rounded-md shadow-md"
                        imageClassName="aspect-[3/4] object-cover w-full bg-white"
                      />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{recap.recapName}</div>
                      <div className="text-sm font-semibold">Tóm tắt sách &#34;{recap.bookName}&#34;</div>
                      <div className="text-sm text-gray-500">Trạng thái: {recap.isPublished ? "Công khai" : "Ẩn"}</div>
                      <div className="text-sm text-gray-500">Lượt xem: {recap.viewsCount}</div>
                      <div className="text-sm text-gray-500">Lượt thích: {recap.likesCount}</div>
                    </div>
                  </Link>
                </Fragment>
              ))}
            </Show>
          </div>
        </div>

        {/* Most Views in Last Month Section */}
        <div className="flex-1">
          <div className="text-xl font-semibold mb-4">Most views in last month</div>
          <div className="space-y-4 bg-white rounded-md border border-gray-300 p-2">
            <Show when={data.mostViewedRecaps.$values.slice(0, 4).length > 0} fallback={
              <div className="text-center text-gray-500">No recaps found</div>
            }>
              {data.mostViewedRecaps.$values.map((recap, index) => (
                <Fragment key={index}>
                  <Show when={index !== 0}>
                    <Divider/>
                  </Show>
                  <Link to={generatePath(routes.recapDetails, {recapId: recap.recapId})} className="flex gap-4 p-5 hover:bg-gray-100">
                    <div className="w-20 bg-gray-200 rounded-md flex items-center justify-center">
                      <Image
                        src={recap.bookImage || "/empty-image.jpg"}
                        alt={recap.bookName}
                        className="block overflow-hidden rounded-md shadow-md"
                        imageClassName="aspect-[3/4] object-cover w-full bg-white"
                      />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{recap.recapName}</div>
                      <div className="text-sm font-semibold">Tóm tắt sách &#34;{recap.bookName}&#34;</div>
                      <div className="text-sm text-gray-500">Trạng thái: {recap.isPublished ? "Công khai" : "Ẩn"}</div>
                      <div className="text-sm text-gray-500">Lượt xem: {recap.viewsCount}</div>
                      <div className="text-sm text-gray-500">Lượt thích: {recap.likesCount}</div>
                    </div>
                  </Link>
                </Fragment>
              ))}
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;