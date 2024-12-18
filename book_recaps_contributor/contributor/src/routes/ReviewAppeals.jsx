import { generatePath, json, Link, redirect, useLoaderData, useRevalidator } from "react-router-dom";
import { axiosInstance2 } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import CustomBreadCrumb from "../components/CustomBreadCrumb";
import { routes } from "../routes";
import { Badge } from "primereact/badge";
import Table from "../components/table";
import { getCurrentUserInfo } from "../utils/getCurrentUserInfo";
import { useEffect, useState } from "react";
import CreateAppealDialog from "../components/CreateAppealDialog";

const getReviewAppeals = async (reviewId, request) => {
  try {
    const response = await axiosInstance2.get('/reviews/' + reviewId + "/appeals", {
      signal: request.signal
    });
    return response.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const reviewAppealsLoader = async ({ params, request }) => {
  const data = await getReviewAppeals(params.reviewId, request);

  const user = getCurrentUserInfo();
  if (data.contributor_id.toLowerCase() !== user.id.toLowerCase()) {
    return redirect(routes.recaps);
  }
  console.log(data);

  return {
    review: data.review,
    appeals: data.appeals
  };
}

const getAppealStatusStr = (status) => {
  switch (status) {
    case 0:
      return 'Đã gửi';
    case 1:
      return 'Đang xem xét';
    case 2:
      return 'Đã xử lý';
    default:
      return 'Không xác định';
  }
}

const ReviewAppeals = () => {
  const { appeals, review } = useLoaderData();
  const revalidator = useRevalidator();
  const [ dialogVisible, setDialogVisible ] = useState(false);

  useEffect(() => {
    const handleFocus = async () => {
      revalidator.revalidate();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <>
      <CreateAppealDialog
        reviewId={review.id}
        dialogVisible={dialogVisible}
        setDialogVisible={setDialogVisible}
        onSubmitted={() => revalidator.revalidate()}
      />

      <CustomBreadCrumb items={[
        { label: "Recaps", path: routes.recaps },
        {
          label: "Recap version details",
          path: generatePath(routes.recapVersionDetails, { versionId: review.recapVersionId })
        },
        { label: "Review appeals" }
      ]}/>

      <Table.Container title="Lịch sử xử lý đơn kháng cáo" addButton={
        <button
          className="px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-600"
          onClick={() => setDialogVisible(true)}
        >
          Tạo kháng cáo mới
        </button>
      }>
        <Table.Head columns={[
          'Nội dung',
          'Ngày tạo',
          'Xử lý',
          'Nhân viên xử lý',
          'Trạng thái',
          ''
        ]}/>
        <Table.Body
          when={appeals.length > 0}
          fallback={
            <Table.Row>
              <Table.Cell colSpan="100" className="h-32 text-center">
                <div className="flex gap-2 justify-center items-center">
                  <p>Lịch sử không có dữ liệu</p>
                </div>
              </Table.Cell>
            </Table.Row>
          }
        >
          {appeals.map((appeal) => (
            <Table.Row key={appeal.id}>
              <Table.Cell isFirstCell={true}>
                <div className="min-w-28">{appeal.reason}</div>
              </Table.Cell>
              <Table.Cell>{appeal.createdAt ? new Date(appeal.createdAt + "Z").toLocaleString() : 'N/A'}</Table.Cell>
              <Table.Cell>
                <div className="min-w-28">{appeal.response}</div>
              </Table.Cell>
              <Table.Cell>{appeal.staff?.fullName}</Table.Cell>
              <Table.Cell>
                <Badge
                  value={getAppealStatusStr(appeal.appealStatus)}
                  severity={
                    appeal.appealStatus === 0 ? 'secondary' :
                      appeal.appealStatus === 1 ? 'warning' :
                        appeal.appealStatus === 2 ? 'success' :
                          'danger'
                  }/>
              </Table.Cell>
              <Table.Cell>{appeal.updatedAt ? new Date(appeal.updatedAt + "Z").toLocaleString() : 'N/A'}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
      <div className="mt-4 px-2">
        <Link
          to={generatePath(routes.recapVersionDetails, { versionId: review.recapVersionId })}
          className="text-blue-500 underline p-0 text-start hover:text-blue-700"
        >
          Quay lại chi tiết phiên bản
        </Link>
      </div>
    </>
  );
}

export default ReviewAppeals;