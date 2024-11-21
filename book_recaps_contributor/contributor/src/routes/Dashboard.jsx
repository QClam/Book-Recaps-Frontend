import CustomBreadCrumb from "../components/CustomBreadCrumb";
import { Divider } from "primereact/divider";
import { Link } from "react-router-dom";
import { routes } from "../routes";
import { Fragment } from "react";
import Show from "../components/Show";

const Dashboard = () => {
  return (
    <>
      <CustomBreadCrumb items={[ { label: "Dashboard" } ]}/>

      {/* Performance Overview Section */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Thu nhập</div>
          <div className="text-2xl font-bold mb-2">-- VND</div>
          <div>
            <div className="text-sm text-gray-500">Tháng trước</div>
            <div className="flex items-center justify-between gap-3">
              <p>--</p>
              <i className="pi pi-chart-line text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Lượt xem</div>
          <div className="text-2xl font-bold mb-2">--</div>
          <div>
            <div className="text-sm text-gray-500">Tháng trước</div>
            <div className="flex items-center justify-between gap-3">
              <p>--</p>
              <i className="pi pi-eye text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Số bài viết mới</div>
          <div className="text-2xl font-bold mb-2">--</div>
          <div>
            <div className="text-sm text-gray-500">Tháng trước</div>
            <div className="flex items-center justify-between gap-3">
              <p>--</p>
              <i className="pi pi-file text-gray-500 text-2xl"></i>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="text-lg font-semibold">Số dư hiện tại</div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-2xl font-bold mb-2">-- VND</div>
            <i className="pi pi-wallet text-gray-500 text-2xl"></i>
          </div>
          <Divider/>
          <div className="flex items-center justify-end">
            <Link to={routes.earningWithdrawals} className="font-semibold text-indigo-600 hover:underline">Lịch sử rút
              tiền</Link>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-end">
        {/* Published Recaps Section */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-semibold">Published recaps</div>
            <Link to={routes.recaps} className="bg-blue-500 text-white font-semibold py-1.5 px-3 rounded-md">
              All recaps
            </Link>
          </div>
          <div className="space-y-4 bg-white rounded-md border border-gray-300 p-5">
            {[ 1, 2 ].map((recap, index) => (
              <Fragment key={index}>
                <Show when={index !== 0}>
                  <Divider/>
                </Show>
                <div className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                    --
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Tóm tắt sách "..."</div>
                    <div className="text-sm text-gray-500">Trạng thái: Công khai</div>
                    <div className="text-sm text-gray-500">Lượt xem: 1000</div>
                    <div className="text-sm text-gray-500">Lượt thích: 10</div>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Most Views in Last Month Section */}
        <div className="flex-1">
          <div className="text-xl font-semibold mb-4">Most views in last month</div>
          <div className="space-y-4 bg-white rounded-md border border-gray-300 p-5">
            {[ 1, 2 ].map((recap, index) => (
              <Fragment key={index}>
                <Show when={index !== 0}>
                  <Divider/>
                </Show>
                <div className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                    --
                  </div>
                  <div>
                    <div className="text-lg font-semibold">Tóm tắt sách "..."</div>
                    <div className="text-sm text-gray-500">Trạng thái: Công khai</div>
                    <div className="text-sm text-gray-500">Lượt xem: 1000</div>
                    <div className="text-sm text-gray-500">Lượt thích: 10</div>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;