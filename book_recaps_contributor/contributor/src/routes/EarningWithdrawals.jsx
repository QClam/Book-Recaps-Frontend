import { Suspense, useEffect, useState } from 'react';
import { Dialog } from "primereact/dialog";
import CustomBreadCrumb from "../components/CustomBreadCrumb";
import Table from "../components/table";
import { ProgressSpinner } from "primereact/progressspinner";
import {
  Await,
  defer,
  json,
  redirect,
  useActionData,
  useAsyncValue,
  useLoaderData,
  useNavigation,
  useSubmit
} from "react-router-dom";
import { Image } from "primereact/image";
import { axiosInstance } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import { getCurrentUserInfo } from "../utils/getCurrentUserInfo";
import Modal from "../components/modal";
import TextInput from "../components/form/TextInput";
import { turnNumberToVNDStr, turnVNDStrToNumber } from "../utils/formatNumberWithCommas";
import { Divider } from "primereact/divider";
import { Badge } from "primereact/badge";
import { routes } from "../routes";
import { useAuth } from "../contexts/Auth";
import { useToast } from "../contexts/Toast";
import { cn } from "../utils/cn";

const getWithdrawlsInfo = async (recapId, request) => {
  try {
    const user = getCurrentUserInfo();
    if (!user) return redirect(routes.logout);

    const response = await axiosInstance.get('/api/contributorwithdrawal/getlistdrawalbycontributorid/' + user.id, {
      signal: request.signal
    });
    return response.data.data;
  } catch (error) {
    const err = handleFetchError(error);
    throw json({ error: err.error }, { status: err.status });
  }
}

export const earningWithdrawalsAction = async ({ request }) => {
  const formData = await request.formData();
  const contributorId = formData.get('contributorId');
  const amount = formData.get('amount');

  if (!contributorId || !amount) {
    return { error: "Invalid request data" };
  }

  try {
    const response = await axiosInstance.post('/api/contributorwithdrawal/createdrawal/' + contributorId, {}, {
      params: { amount },
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

export const earningWithdrawalsLoader = async ({ params, request }) => {
  const withdrawInfo = getWithdrawlsInfo(params.recapId, request);

  return defer({
    withdrawInfo
  });
}

const EarningWithdrawals = () => {
  const { withdrawInfo } = useLoaderData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();

  const { user } = useAuth()
  const { showToast } = useToast();
  const [ withdrawDialog, setWithdrawDialog ] = useState(false);
  const [ confirmationDialog, setConfirmationDialog ] = useState(false);
  const [ successDialog, setSuccessDialog ] = useState(false);
  const [ withdrawAmount, setWithdrawAmount ] = useState("");

  useEffect(() => {
    if (actionData?.error) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: actionData.error,
      });
    }

    if (actionData?.success) {
      setConfirmationDialog(false);
      setSuccessDialog(true);
    }
  }, [ actionData ]);

  const openWithdrawDialog = () => {
    setWithdrawAmount("");
    setWithdrawDialog(true);
  };

  const confirmWithdrawal = () => {
    setWithdrawDialog(false);
    setConfirmationDialog(true);
  };

  const completeWithdrawal = () => {
    if (navigation.state === "submitting") return;
    submit({ contributorId: user.id, amount: withdrawAmount }, { method: 'post' })
  };

  return (
    <>
      <CustomBreadCrumb items={[ { label: "Withdraw earnings" } ]}/>
      <h1 className="mt-4 mb-6 text-xl font-semibold text-gray-900">Thông tin tài khoản</h1>

      {/* Main Section */}
      <div className="flex gap-4">
        <div className="p-4 bg-white rounded-md shadow-sm border border-gray-300 w-fit pr-8">
          <div className="text-lg font-semibold mb-4">Số dư hiện tại:</div>
          <div className="text-2xl text-indigo-600 font-bold mb-2">
            <Suspense fallback={
              <div className="flex items-center gap-2">
                <div>
                  <ProgressSpinner
                    style={{ width: '15px', height: '15px' }}
                    strokeWidth="8"
                    fill="var(--surface-ground)"
                    animationDuration=".5s"
                  />
                </div>
                <span>Loading...</span>
              </div>
            }>
              <Await resolve={withdrawInfo} errorElement={<>Error occurred</>}>
                {(resolvedWithdrawInfo) => (
                  <div>
                    {Number(resolvedWithdrawInfo.totalEarning).toLocaleString("vi-VN")} VNĐ
                  </div>
                )}
              </Await>
            </Suspense>
          </div>
        </div>

        <div className="p-4 bg-white rounded-md shadow-sm border border-gray-300 w-fit pr-8">
          <div className="text-lg font-semibold mb-4">Tổng tiền đã rút:</div>
          <div className="text-2xl text-indigo-600 font-bold mb-2">
            <Suspense fallback={
              <div className="flex items-center gap-2">
                <div>
                  <ProgressSpinner
                    style={{ width: '15px', height: '15px' }}
                    strokeWidth="8"
                    fill="var(--surface-ground)"
                    animationDuration=".5s"
                  />
                </div>
                <span>Loading...</span>
              </div>
            }>
              <Await resolve={withdrawInfo} errorElement={<>Error occurred</>}>
                {(resolvedWithdrawInfo) => (
                  <div>
                    {Number(resolvedWithdrawInfo.withdrawal).toLocaleString("vi-VN")} VNĐ
                  </div>
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="mt-8 mb-6 text-xl font-semibold text-gray-900">Lịch sử yêu cầu rút tiền</h2>

        <button
          onClick={openWithdrawDialog}
          className="px-5 py-2 font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-800"
        >
          Tạo yêu cầu rút tiền
        </button>
      </div>

      {/* Withdrawal History Section */}
      <Table.Container>
        <Table.Head columns={[
          'Hình ảnh',
          'Tổng tiền',
          'Ghi chú',
          'Trạng thái',
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
                  <p>Loading withdraw history...</p>
                </div>
              </td>
            </tr>
            </tbody>
          }
        >
          <Await
            resolve={withdrawInfo}
            errorElement={
              <tbody>
              <tr>
                <td className="h-32 text-center" colSpan="100">Error loading withdraw history!</td>
              </tr>
              </tbody>
            }
          >
            <WithdrawRequestsTable/>
          </Await>
        </Suspense>
      </Table.Container>

      {/* Withdraw Dialog */}
      <Dialog
        visible={withdrawDialog}
        onHide={() => setWithdrawDialog(false)}
        content={({ hide }) => (
          <Modal.Wrapper>
            <Modal.Header title="Rút tiền" onClose={hide}/>
            <Modal.Body className="space-y-4">
              <div className="p-4 bg-white rounded-md shadow-sm border border-gray-300">
                <div className="text-lg font-semibold">Số dư hiện tại</div>
                <Suspense fallback={
                  <div className="flex items-center gap-2">
                    <div>
                      <ProgressSpinner
                        style={{ width: '15px', height: '15px' }}
                        strokeWidth="8"
                        fill="var(--surface-ground)"
                        animationDuration=".5s"
                      />
                    </div>
                    <span>Loading...</span>
                  </div>
                }>
                  <Await resolve={withdrawInfo} errorElement={<>Error occurred</>}>
                    {(resolvedWithdrawInfo) => (
                      <div className="text-xl text-indigo-600 font-bold">
                        {Number(resolvedWithdrawInfo.totalEarning).toLocaleString("vi")} VNĐ
                      </div>
                    )}
                  </Await>
                </Suspense>
              </div>
              <Suspense fallback={
                <div className="flex items-center gap-2">
                  <div>
                    <ProgressSpinner
                      style={{ width: '15px', height: '15px' }}
                      strokeWidth="8"
                      fill="var(--surface-ground)"
                      animationDuration=".5s"
                    />
                  </div>
                  <span>Loading...</span>
                </div>
              }>
                <Await resolve={withdrawInfo} errorElement={<>Error occurred</>}>
                  {(resolvedWithdrawInfo) => (
                    <TextInput
                      id="amount"
                      label="Số tiền cần rút:"
                      name="amount"
                      placeholder="0đ"
                      required
                      value={turnNumberToVNDStr(withdrawAmount)}
                      onChange={(e) => setWithdrawAmount(turnVNDStrToNumber(e.target.value))}
                      error={
                        withdrawAmount && withdrawAmount < 50000 ? "Số tiền rút tối thiểu là 50,000đ" :
                          withdrawAmount > resolvedWithdrawInfo.totalEarning ? "Số tiền vượt quá số dư hiện tại" :
                            withdrawAmount % 1000 !== 0 ? "Số tiền phải là bội số của 1,000đ" : ""
                      }
                    />
                  )}
                </Await>
              </Suspense>
              <div className="mb-4 flex items-start">
                <input type="radio" className="mr-2 mt-1 cursor-default" defaultChecked readOnly/>
                <div>
                  <p>Nhận tiền trực tiếp</p>
                  <p className="text-gray-600 text-sm">(Hiện tại hệ thống chỉ hỗ trợ rút tiền mặt trực tiếp tại chi
                    nhánh)</p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-end gap-3 text-sm">
              <Suspense fallback={
                <div className="flex items-center gap-2">
                  <div>
                    <ProgressSpinner
                      style={{ width: '15px', height: '15px' }}
                      strokeWidth="8"
                      fill="var(--surface-ground)"
                      animationDuration=".5s"
                    />
                  </div>
                  <span>Loading...</span>
                </div>
              }>
                <Await resolve={withdrawInfo} errorElement={<>Error occurred</>}>
                  {(resolvedWithdrawInfo) => (
                    <button
                      onClick={confirmWithdrawal}
                      className="text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={withdrawAmount < 50000 || withdrawAmount > resolvedWithdrawInfo.totalEarning || withdrawAmount % 1000 !== 0}
                    >
                      Rút tiền
                    </button>
                  )}
                </Await>
              </Suspense>
            </Modal.Footer>
          </Modal.Wrapper>
        )}
      />

      {/* Confirmation Dialog */}
      <Dialog
        visible={confirmationDialog}
        onHide={() => {
          if (navigation.state === "submitting") return;
          setConfirmationDialog(false)
        }}
        content={({ hide }) => (
          <Modal.Wrapper className={cn({ "cursor-progress": navigation.state === "submitting" })}>
            <Modal.Header title="Xác nhận rút tiền" onClose={hide}/>
            <Modal.Body className="space-y-4">
              <div className="p-4 bg-white rounded-md shadow-sm border border-gray-300 space-y-4">
                <div className="flex justify-between gap-9">
                  <p>Rút về:</p>
                  <p className="font-semibold">Nhận tiền trực tiếp</p>
                </div>
                <div className="flex justify-between gap-9">
                  <p>Số tiền:</p>
                  <p className="font-semibold">{withdrawAmount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <Divider/>
                <div className="flex justify-between gap-9">
                  <p>Phí giao dịch:</p>
                  <p className="font-semibold">Miễn phí</p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-end gap-3 text-sm">
              <div className="w-full space-y-4">
                <div className="flex justify-between gap-9 text-base">
                  <p>Tổng tiền</p>
                  <p className="font-semibold">{withdrawAmount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div className="flex gap-3">
                  <button
                    className="bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300 flex-1"
                    type="button"
                    onClick={hide}
                  >
                    Đóng
                  </button>
                  <button
                    onClick={completeWithdrawal}
                    className="text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700 flex-1"
                  >
                    Rút tiền
                  </button>
                </div>
              </div>
            </Modal.Footer>
          </Modal.Wrapper>
        )}
      />

      {/* Success Dialog */}
      <Dialog
        visible={successDialog}
        onHide={() => setSuccessDialog(false)}
        content={({ hide }) => (
          <Modal.Wrapper>
            <Modal.Header title="Kết quả" onClose={hide}/>
            <Modal.Body className="space-y-4">
              <div className="p-4 bg-white rounded-md shadow-sm border border-gray-300 flex flex-col items-center">
                <i className="pi pi-check-circle text-green-500 text-4xl mb-4"></i>
                <div className="text-lg font-semibold mb-2">
                  Tạo yêu cầu thành công
                </div>
                <p className="font-semibold text-indigo-600">{withdrawAmount.toLocaleString('vi-VN')} VNĐ</p>
                <Divider/>
                <p>
                  Vui lòng đến chi nhánh gần nhất để hoàn tất thủ tục rút tiền. <strong>Yêu cầu sẽ bị hủy sau 24
                  tiếng.</strong>
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-end gap-3 text-sm">
              <button
                className="bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300"
                type="button"
                onClick={hide}
              >
                Đóng
              </button>
            </Modal.Footer>
          </Modal.Wrapper>
        )}
      />
    </>
  );
}

export default EarningWithdrawals;

function WithdrawRequestsTable() {
  const { contributors: { $values: withdraws } } = useAsyncValue();

  return (
    <Table.Body
      when={withdraws && withdraws.length > 0}
      fallback={
        <tr>
          <td className="h-32 text-center" colSpan="100">
            <div className="flex gap-2 justify-center items-center">
              <p>No requests found</p>
            </div>
          </td>
        </tr>
      }
    >
      {withdraws.map((wd) => (
        <Table.Row key={wd.drawalId}>
          <Table.Cell isFirstCell={true}>
            <div className="w-20">
              <Image
                src={wd.imageURL || "/empty-image.jpg"}
                alt="Withdraw proof"
                className="block overflow-hidden rounded-md shadow-md"
                imageClassName="aspect-[3/4] object-cover w-full bg-white"
                preview
              />
            </div>
          </Table.Cell>
          <Table.Cell>
            <span className="font-semibold text-indigo-600 text-lg">{wd.totalEarnings.toLocaleString('vi-VN')}đ</span>
          </Table.Cell>
          <Table.Cell>
            <div className="min-w-28">
              <p className="min-w-full line-clamp-2 break-words">
                {wd.description}
              </p>
            </div>
          </Table.Cell>
          <Table.Cell>
            <Badge
              value={wd.status}
              severity={
                wd.status === "Pending" ? 'warning' :
                  wd.status === "Accepted" ? 'success' :
                    'danger'
              }/>
          </Table.Cell>
          <Table.Cell>
            {wd.createAt ? new Date(wd.createAt).toLocaleString() : 'N/A'}
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  )
}
