import { useAuth } from "../contexts/Auth";
import { useToast } from "../contexts/Toast";
import { useState } from "react";
import { axiosInstance } from "../utils/axios";
import { handleFetchError } from "../utils/handleFetchError";
import { Dialog } from "primereact/dialog";
import Modal from "./modal";
import TextArea from "./form/TextArea";
import { cn } from "../utils/cn";

const CreateAppealDialog = ({ dialogVisible, setDialogVisible, reviewId, onSubmitted }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [ reason, setReason ] = useState('');
  const [ isCreatingAppeal, setIsCreatingAppeal ] = useState(false);

  const onCreateAppeal = async () => {
    if (isCreatingAppeal) return;
    if (!reason) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Vui lòng nhập nội dung kháng cáo',
      });
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn tạo đơn kháng cáo?")) return;

    setIsCreatingAppeal(true);
    try {
      await axiosInstance.post('/api/appeal/createappeal', {
        reviewId,
        contributorId: user.id,
        reason
      });

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Đơn kháng cáo đã được tạo thành công',
      });

      setDialogVisible(false);
      setIsCreatingAppeal(false);
      onSubmitted?.();
    } catch (error) {
      console.error(error);
      const err = handleFetchError(error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: err.error,
      });

      setIsCreatingAppeal(false);
    }
  }
  return (
    <Dialog
      visible={dialogVisible}
      onHide={() => {
        if (!dialogVisible) return;
        setDialogVisible(false);
        setReason('');
      }}
      content={({ hide }) => (
        <Modal.Wrapper>
          <Modal.Header title="Tạo đơn kháng cáo" onClose={hide}/>
          <Modal.Body className="pb-0">
            <div className="flex flex-col gap-1">
              <TextArea
                id="reason"
                label="Nội dung:"
                name="reason"
                placeholder="Nội dung đơn"
                required
                onKeyPress={(e) => e.key === 'Enter' && onCreateAppeal()}
                onChange={(e) => setReason(e.target.value)}
                disabled={isCreatingAppeal}
              />
              <Modal.Footer className="-mx-5 mt-5 justify-end gap-3 text-sm">
                <button
                  className={cn({
                    "bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300": true,
                    "opacity-50 cursor-not-allowed": isCreatingAppeal
                  })}
                  type="button"
                  onClick={hide}
                  disabled={isCreatingAppeal}
                >
                  Hủy
                </button>

                <button
                  className={cn({
                    "text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700": true,
                    "opacity-50 cursor-not-allowed": isCreatingAppeal
                  })}
                  type="button"
                  disabled={isCreatingAppeal}
                  onClick={onCreateAppeal}
                >
                  {isCreatingAppeal ? "Loading..." : "Gửi"}
                </button>
              </Modal.Footer>
            </div>
          </Modal.Body>
        </Modal.Wrapper>
      )}
    />
  )
}

export default CreateAppealDialog;