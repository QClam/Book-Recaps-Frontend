import { generatePath, json, useLoaderData } from "react-router-dom";
import { axiosInstance2 } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import CustomBreadCrumb from "../components/CustomBreadCrumb";
import { routes } from "../routes";
import { Badge } from "primereact/badge";
import Table from "../components/table";

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

  return (
    <>
      <CustomBreadCrumb items={[
        { label: "Recaps", path: routes.recaps },
        {
          label: "Recap version details",
          path: generatePath(routes.recapVersionDetails, { versionId: review.recapVersionId })
        },
        { label: "Review appeals" }
      ]}/>

      <Table.Container title="Lịch sử xử lý đơn kháng cáo">
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
              <Table.Cell>{appeal.createdAt ? new Date(appeal.createdAt).toLocaleString() : 'N/A'}</Table.Cell>
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
              <Table.Cell>{appeal.updatedAt ? new Date(appeal.updatedAt).toLocaleString() : 'N/A'}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Container>
    </>
  );
}

export default ReviewAppeals;