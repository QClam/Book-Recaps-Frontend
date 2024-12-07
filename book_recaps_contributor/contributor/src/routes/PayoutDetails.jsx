import { Await, defer, generatePath, json, Link, Navigate, useAsyncValue, useLoaderData } from "react-router-dom";
import { axiosInstance } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import CustomBreadCrumb from "../components/CustomBreadCrumb";
import { routes } from "../routes";
import { Divider } from "primereact/divider";
import { Suspense } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import * as XLSX from 'xlsx'
import { cn } from "../utils/cn";
import Table from "../components/table";
import { useAuth } from "../contexts/Auth";

const getPayoutDetails = async (payoutId, request) => {
  try {
    const response = await axiosInstance.get('/api/contributorpayout/getpayoutinfobyid/' + payoutId, {
      signal: request.signal
    });
    return response.data.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const payoutDetailsLoader = async ({ request, params }) => {
  const payoutDetails = getPayoutDetails(params.payoutId, request);
  return defer({ payoutDetails });
}

const PayoutDetails = () => {
  const { payoutDetails } = useLoaderData();

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Payouts", path: routes.payouts }, { label: "Payout Details" } ]}/>

      <Suspense
        fallback={
          <div className="h-32 flex gap-2 justify-center items-center">
            <div>
              <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"
                               fill="var(--surface-ground)" animationDuration=".5s"/>
            </div>
            <p>Loading payout information...</p>
          </div>
        }>
        <Await resolve={payoutDetails} errorElement={
          <div className="h-14 flex gap-2 justify-center items-center italic font-semibold text-gray-400">
            Error loading payout info!
          </div>
        }>
          <PayoutDetailsImpl/>
        </Await>
      </Suspense>
    </>
  );
}

export default PayoutDetails;

const getPayoutStatusStr = (status) => {
  switch (status) {
    case 0:
      return 'Đang xử lý';
    case 1:
      return 'Hoàn tất';
    case 2:
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
}

const PayoutDetailsImpl = () => {
  const payoutDetails = useAsyncValue();
  const { user } = useAuth();

  if (payoutDetails.contributor?.id.toLowerCase() !== user.id.toLowerCase()) {
    return <Navigate to={routes.payouts} replace/>;
  }

  const recapEarnings = payoutDetails.recapEarnings.$values;

  const handleExportExcel = () => {
    const earnings = recapEarnings.map((recap) => ({
      'Tiêu đề': recap.recapId,
      'Từ ngày': recap.fromDate ? new Date(recap.fromDate).toLocaleDateString() : 'N/A',
      'Tới ngày': recap.toDate ? new Date(recap.toDate).toLocaleDateString() : 'N/A',
      'Tổng thu nhập': recap.earningAmount.toLocaleString('vi-VN') + '₫'
    }));
    const worksheet = XLSX.utils.json_to_sheet(earnings);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recaps');

    // Xuất workbook ra file Excel
    XLSX.writeFile(workbook, "PayoutData.xlsx");
  }

  return (
    <>
      <h1 className="mt-4 mb-4 text-xl font-semibold text-gray-900">Chi tiết quyết toán</h1>

      {/*  Details*/}
      <div className="flex gap-3">
        <div className="flex-1 p-4 bg-white rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="flex justify-between items-start gap-9">
            <p>Họ tên:</p>
            <p className="font-semibold">{payoutDetails.contributor.fullName}</p>
          </div>
          <div className="flex justify-between items-start gap-9">
            <p>Email:</p>
            <p className="font-semibold">{payoutDetails.contributor.email}</p>
          </div>
          <div className="flex justify-between items-start gap-9">
            <p>Tên tài khoản:</p>
            <p className="font-semibold">{payoutDetails.contributor.userName}</p>
          </div>
        </div>

        <div className="flex-1 p-4 bg-white rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="flex justify-between gap-9">
            <p>Thời gian:</p>
            <p className="font-semibold">
              {new Date(payoutDetails.fromDate).toLocaleDateString()} tới {new Date(payoutDetails.toDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex justify-between gap-9">
            <p>Tổng tiền:</p>
            <p className="font-semibold text-indigo-600">{payoutDetails.amount.toLocaleString('vi-VN')} VNĐ</p>
          </div>
          <div className="flex justify-between gap-9">
            <p>Trạng thái:</p>
            <p className={cn("font-semibold font-semibold", {
              'text-orange-500': payoutDetails.status === 0,
              'text-green-500': payoutDetails.status === 1,
              'text-red-500': payoutDetails.status === 2
            })}>
              {getPayoutStatusStr(payoutDetails.status)}
            </p>
          </div>
        </div>

        <div className="flex-1 p-4 bg-white rounded-md shadow-sm border border-gray-300 space-y-4">
          <div className="flex flex-col h-full">
            <p className="font-semibold">Ghi chú:</p>
            <div className="flex-1 overflow-auto">
              <p>{payoutDetails.description || <span className="italic">(Không có)</span>}</p>
            </div>
          </div>
        </div>
      </div>
      <Divider/>

      {/*  Recaps*/}

      <div className="text-xl font-semibold mt-4 mb-4 flex gap-4">
        <h2 className="text-gray-900">Danh sách bài viết</h2>
        <button
          onClick={handleExportExcel}
          className="hover:underline text-indigo-600">
          (Xuất Excel)
        </button>
      </div>


      <Table.Container>
        <Table.Head columns={[
          'Tiêu đề',
          'Từ ngày',
          'Tới ngày',
          'Tổng thu nhập',
        ]}/>

        <Table.Body
          when={recapEarnings && recapEarnings.length > 0}
          fallback={
            <tr>
              <td className="h-32 text-center" colSpan="100">
                <div className="flex gap-2 justify-center items-center">
                  <p>No recap found</p>
                </div>
              </td>
            </tr>
          }>
          {recapEarnings.map((recap) => (
            <Table.Row key={recap.recapId}>
              <Table.Cell isFirstCell={true}>
                <Link
                  to={generatePath(routes.recapDetails, { recapId: recap.recapId })}
                  className="font-semibold text-indigo-600 hover:underline"
                  state={(() => {
                    let fDate = recap.fromDate;

                    if (fDate === "0001-01-01T00:00:00") {
                      fDate = new Date(recap.toDate);
                      fDate.setDate(fDate.getDate() - 30);
                      fDate = fDate.toISOString();
                    }

                    return {
                      fromDate: fDate,
                      toDate: recap.toDate,
                      openChart: true
                    }
                  })()}
                >
                  {recap.recap.name}
                </Link>
              </Table.Cell>
              <Table.Cell>
                {recap.fromDate ? new Date(recap.fromDate).toLocaleDateString() : 'N/A'}
              </Table.Cell>
              <Table.Cell>
                {recap.toDate ? new Date(recap.toDate).toLocaleDateString() : 'N/A'}
              </Table.Cell>
              <Table.Cell>
                <p
                  className="font-semibold text-indigo-600 text-lg">{recap.earningAmount.toLocaleString('vi-VN')}đ</p>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </>
  )
}