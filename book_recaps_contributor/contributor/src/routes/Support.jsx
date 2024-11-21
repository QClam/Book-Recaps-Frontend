import CustomBreadCrumb from "../components/CustomBreadCrumb";
import { Suspense, useState } from "react";
import Table from "../components/table";
import { ProgressSpinner } from "primereact/progressspinner";
import { Await, defer, Form, json, redirect, useAsyncValue, useLoaderData, useNavigation } from "react-router-dom";
import { getCurrentUserInfo } from "../utils/getCurrentUserInfo";
import { routes } from "../routes";
import { axiosInstance } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import { Badge } from "primereact/badge";
import { Dialog } from "primereact/dialog";
import Modal from "../components/modal";
import TextArea from "../components/form/TextArea";
import Select from "../components/form/Select";
import { cn } from "../utils/cn";
import { useAuth } from "../contexts/Auth";

const getSupportTickets = async (request) => {
  try {
    const user = getCurrentUserInfo();
    if (!user) return redirect(routes.logout);

    const response = await axiosInstance.get('/api/supportticket/getsupportticketbyuser/' + user.id, {
      signal: request.signal
    });
    return response.data.data.$values.reverse();
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const supportTicketsAction = async ({ request }) => {
  const formData = await request.formData();
  const userId = formData.get('userId');
  const description = formData.get('description');
  const category = formData.get('category');

  if (!userId || !description || !category) {
    return { error: "Invalid request data" };
  }

  try {
    const response = await axiosInstance.post('/api/supportticket/create', {
      userId,
      description,
      category
    }, {
      signal: request.signal
    });

    return {
      data: response.data,
      success: true,
      method: 'post'
    }
  } catch (error) {
    const err = handleFetchError(error);
    if (err.status === 401) {
      return redirect(routes.logout);
    }
    return { ...err, method: 'post' };
  }
}

export const supportTicketsLoader = async ({ request }) => {
  const supportTickets = getSupportTickets(request);

  return defer({
    supportTickets
  });
}

const Support = () => {
  const { supportTickets } = useLoaderData();
  const navigation = useNavigation();
  const [ openCreateDialog, setOpenCreateDialog ] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Support" } ]}/>

      <div className="flex justify-between items-center">
        <h1 className="mt-4 mb-6 text-xl font-semibold text-gray-900">Lịch sử yêu cầu hỗ trợ</h1>

        <button
          onClick={() => setOpenCreateDialog(true)}
          className="px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800"
        >
          Tạo yêu cầu hỗ trợ
        </button>
      </div>

      <Table.Container>
        <Table.Head columns={[
          'Loại yêu cầu',
          'Nội dung',
          'Trạng thái',
          'Phản hồi',
          'Ngày tạo',
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
                  <p>Loading support history...</p>
                </div>
              </td>
            </tr>
            </tbody>
          }
        >
          <Await
            resolve={supportTickets}
            errorElement={
              <tbody>
              <tr>
                <td className="h-32 text-center" colSpan="100">Error loading support history!</td>
              </tr>
              </tbody>
            }
          >
            <SupportTicketsTable/>
          </Await>
        </Suspense>
      </Table.Container>

      <Dialog
        visible={openCreateDialog}
        onHide={() => setOpenCreateDialog(false)}
        content={({ hide }) => (
          <Modal.Wrapper className="min-w-96">
            <Modal.Header title="Thông tin yêu cầu" onClose={hide}/>

            <Form className="flex flex-col" method="post">
              <Modal.Body className="space-y-4">
                <Select
                  id="category"
                  label="Loại yêu cầu:"
                  name="category"
                  options={[
                    { value: "Vấn đề bản quyền", label: "Vấn đề bản quyền" },
                    { value: "Hỗ trợ rút tiền", label: "Hỗ trợ rút tiền" },
                    { value: "Hỗ trợ khác", label: "Hỗ trợ khác" },
                  ]}
                  required
                />
                <TextArea
                  id="description"
                  label="Nội dung:"
                  name="description"
                  placeholder="Nhập nội dung yêu cầu hỗ trợ"
                  required
                />
                <input type="hidden" name="userId" value={user.id}/>
              </Modal.Body>
              <Modal.Footer className="justify-end gap-3 text-sm">
                <button
                  className={cn(
                    "bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300",
                    { "opacity-50 cursor-not-allowed": navigation.state === "loading" }
                  )}
                  type="button"
                  onClick={hide}
                  disabled={navigation.state === "loading"}
                >
                  Hủy
                </button>
                <button
                  className="text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-progress"
                  disabled={navigation.state === 'loading' || navigation.state === 'submitting'}
                  type="submit"
                >
                  Gửi yêu cầu
                </button>
              </Modal.Footer>
            </Form>
          </Modal.Wrapper>
        )}
      />
    </>
  )
}

export default Support

const getTicketStatusStr = (status) => {
  switch (status) {
    case 0:
      return 'Đã gửi';
    case 1:
      return 'Đang xem xét';
    case 2:
      return 'Hoàn tất';
    default:
      return 'Không xác định';
  }
}

function SupportTicketsTable() {
  const supportTickets = useAsyncValue();

  return (
    <Table.Body
      when={supportTickets && supportTickets.length > 0}
      fallback={
        <tr>
          <td className="h-32 text-center" colSpan="100">
            <div className="flex gap-2 justify-center items-center">
              <p>No tickets found</p>
            </div>
          </td>
        </tr>
      }
    >
      {supportTickets.map((sp) => (
        <Table.Row key={sp.id}>
          <Table.Cell isFirstCell={true}>
            {sp.category}
          </Table.Cell>
          <Table.Cell>
            <div className="min-w-28">
              <p className="min-w-full line-clamp-2 break-words">
                {sp.description}
              </p>
            </div>
          </Table.Cell>
          <Table.Cell>
            <Badge value={getTicketStatusStr(sp.status)}
                   severity={sp.status === 0 ? 'info' : sp.status === 1 ? 'warning' : 'success'}/>
          </Table.Cell>
          <Table.Cell>
            <div className="min-w-28">
              <p className="min-w-full line-clamp-2 break-words">
                {sp.response}
              </p>
            </div>
          </Table.Cell>
          <Table.Cell>
            {sp.createdAt ? new Date(sp.createdAt).toLocaleString() : 'N/A'}
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  )
}
