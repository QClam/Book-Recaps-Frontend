import CustomBreadCrumb from "../components/CustomBreadCrumb";
import Table from "../components/table";
import { Suspense } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Await, defer, generatePath, json, Link, redirect, useAsyncValue, useLoaderData } from "react-router-dom";
import { Badge } from "primereact/badge";
import { getCurrentUserInfo } from "../utils/getCurrentUserInfo";
import { axiosInstance } from "../utils/axios";
import { routes } from "../routes";
import { handleFetchError } from "../utils/handleFetchError";
import { TbEye } from "react-icons/tb";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import SuspenseAwait from "../components/SuspenseAwait";

const getPayouts = async (request) => {
  try {
    const user = getCurrentUserInfo();
    if (!user) return redirect(routes.logout);

    const response = await axiosInstance.get('/api/contributorpayout/getlistpayoutinfobycontributorid/' + user.id, {
      signal: request.signal
    });
    return response.data.data.$values;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const payoutsLoader = async ({ request }) => {
  const payouts = getPayouts(request);
  return defer({ payouts });
}

const Payouts = () => {
  const { payouts } = useLoaderData();

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Payouts" } ]}/>

      <h1 className="mt-4 mb-6 text-xl font-semibold text-gray-900">Lịch sử quyết toán</h1>

      <SuspenseAwait
        resolve={payouts}
        errorElement={<div className="text-red-500 text-center">Error loading payout history!</div>}
        defaultLoadingMessage="Loading payout history..."
      >
        <PayoutChart/>
      </SuspenseAwait>

      <Table.Container>
        <Table.Head columns={[
          'Từ ngày',
          'Tới ngày',
          'Tổng thu nhập',
          'Trạng thái',
          'Ngày tạo',
          ''
        ]}/>
        <Suspense
          fallback={
            <tbody>
            <tr>
              <td className="h-32 text-center" colSpan="100">
                <div className="flex gap-2 justify-center items-center">
                  <div>
                    <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                                     fill="var(--surface-ground)" animationDuration=".5s"/>
                  </div>
                  <p>Loading payout history...</p>
                </div>
              </td>
            </tr>
            </tbody>
          }
        >
          <Await
            resolve={payouts}
            errorElement={
              <tbody>
              <tr>
                <td className="h-32 text-center" colSpan="100">Error loading payout history!</td>
              </tr>
              </tbody>
            }
          >
            <PayoutsTable/>
          </Await>
        </Suspense>
      </Table.Container>
    </>
  );
}

export default Payouts;

function PayoutsTable() {
  const payouts = useAsyncValue();

  return (
    <Table.Body
      when={payouts && payouts.length > 0}
      fallback={
        <tr>
          <td className="h-32 text-center" colSpan="100">
            <div className="flex gap-2 justify-center items-center">
              <p>No payout found</p>
            </div>
          </td>
        </tr>
      }>
      {payouts.map((p) => (
        <Table.Row key={p.payoutId}>
          <Table.Cell isFirstCell={true}>
            {p.fromdate ? new Date(p.fromdate).toLocaleDateString() : 'N/A'}
          </Table.Cell>
          <Table.Cell>
            {p.todate ? new Date(p.todate).toLocaleDateString() : 'N/A'}
          </Table.Cell>
          <Table.Cell>
            <p className="font-semibold text-indigo-600 text-lg">{p.totalEarnings.toLocaleString('vi-VN')}₫</p>
          </Table.Cell>
          <Table.Cell>
            <Badge
              value={p.status}
              severity={p.status === "Pending" ? 'warning' : p.status === "Done" ? 'success' : 'danger'}
            />
          </Table.Cell>
          <Table.Cell>
            {p.createAt ? new Date(p.createAt + "Z").toLocaleString() : 'N/A'}
          </Table.Cell>
          <Table.Cell>
            <Link
              to={generatePath(routes.payoutDetails, { payoutId: p.payoutId })}
              className="block w-fit border rounded p-1 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-progress"
              title="View details"
            >
              <span className="text-lg"><TbEye/></span>
            </Link>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  )
}

const PayoutChart = () => {
  const payouts = useAsyncValue();

  const dashboardData = payouts.filter((p) => p.status === "Done").map((item) => ({
    date: new Date(item.todate).toLocaleDateString().slice(0, 5),
    earnings: item.totalEarnings
  })).reverse();

  return (
    <div className="max-h-[400px] aspect-video p-4 bg-white rounded-lg shadow-md border border-gray-300 mb-6">
      <ResponsiveContainer>
        <AreaChart data={dashboardData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="date"/>
          <YAxis/>
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip/>
          <Legend verticalAlign="bottom" wrapperStyle={{
            // bottom: -10,
            width: '100%',
          }}/>
          <Area
            type="monotone"
            fillOpacity={1}
            dataKey="earnings"
            stroke="#82ca9d"
            fill="url(#colorViews)"
            name="Thu nhập quyết toán (VNĐ)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}