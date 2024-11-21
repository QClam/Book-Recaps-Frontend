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
            <p className="font-semibold text-indigo-600 text-lg">{p.totalEarnings.toLocaleString('vi-VN')}đ</p>
          </Table.Cell>
          <Table.Cell>
            <Badge
              value={p.status}
              severity={p.status === "Pending" ? 'warning' : p.status === "Done" ? 'success' : 'danger'}
            />
          </Table.Cell>
          <Table.Cell>
            {p.createAt ? new Date(p.createAt).toLocaleString() : 'N/A'}
          </Table.Cell>
          <Table.Cell>
            <Link
              to={generatePath(routes.payoutDetails, { payoutId: p.payoutId })}
              className="block w-fit border rounded p-1 hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-progress"
              type="submit"
              title="View details"
              disabled={navigation.state === 'loading'}
            >
              <span className="text-lg"><TbEye/></span>
            </Link>
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  )
}
