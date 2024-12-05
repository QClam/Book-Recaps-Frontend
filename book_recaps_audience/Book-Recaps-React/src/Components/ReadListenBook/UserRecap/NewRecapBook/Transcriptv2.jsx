import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ContextMenu } from "primereact/contextmenu";
import { axiosInstance } from "../../../../utils/axios";
import { cn } from "../../../../utils/cn";
import { Image } from "primereact/image";
import { useAuth } from "../../../../contexts/Auth";
import { MediaActionTypes, useMediaDispatch, useMediaSelector } from "media-chrome/react/media-store";
import { toast } from "react-toastify";
import { Tooltip } from "primereact/tooltip";
import Show from "../../../Show";
import { Dialog } from "primereact/dialog";
import Modal from "../../../modal";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";

const initialContextMenu = {
  selectedText: '',
  sentenceIndex: null,
  isHighlighted: false,
  highlightNote: '',
}

const Transcriptv2 = ({ transcriptData, userId, recapVersionId, isGenAudio }) => {
  const { user, isAuthenticated } = useAuth();
  const hasSubscription = user?.profileData.subscriptions.$values.some((sub) => sub.status === 0);

  const dispatch = useMediaDispatch();
  const currentTime = useMediaSelector(state => state.mediaCurrentTime);

  const [ openCreateDialog, setOpenCreateDialog ] = useState(false);
  const [ contextMenu, setContextMenu ] = useState(initialContextMenu);
  const [ activeSentenceIndex, setActiveSentenceIndex ] = useState(null);
  const [ highlightedSentences, setHighlightedSentences ] = useState([]);
  const [ updatingHighlight, setUpdatingHighlight ] = useState(false);

  const sentenceRefs = useRef({});
  const cm = useRef(null);

  useEffect(() => {
    const fetchUserHighlights = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await axiosInstance.get(`/api/highlight/gethighlightbyrecapid/${recapVersionId}?userid=${userId}`);
        console.log("Highlights response:", response.data);

        if (response.data && response.data.data && response.data.data.$values) {
          setHighlightedSentences(response.data.data.$values);
        }
      } catch (error) {
        console.error("Error fetching highlights:", error);
      }
    };

    fetchUserHighlights();
  }, []);

  // Highlight the corresponded sentence when the audio is playing
  useEffect(() => {
    // Tắt highlight nếu không phải là audio generate từ google
    if (!isGenAudio) {
      setActiveSentenceIndex(null);
      return;
    }

    let found = false;
    for (let sentence of sentences) {
      if (
        isFinite(sentence.start) && isFinite(sentence.end) &&
        currentTime >= sentence.start && currentTime <= sentence.end
      ) {
        // console.log("Highlighting sentence:", currentTime);
        if (activeSentenceIndex !== String(sentence.sentence_index)) setActiveSentenceIndex(String(sentence.sentence_index));
        found = true;
        break;
      }
    }

    if (!found) {
      setActiveSentenceIndex(null);
    }
  }, [ currentTime ]);

  const sentences = useMemo(() => {
    const sents = [];
    transcriptData.transcriptSections.forEach(section => {
      section.transcriptSentences.forEach(sentence => sents.push(sentence))
    })
    return sents;
  }, [ transcriptData ])

  const handleSentenceClick = (startTime) => {
    dispatch({ type: MediaActionTypes.MEDIA_SEEK_REQUEST, detail: parseFloat(startTime) });
  };

  const handleHighlight = async () => {
    if (!isAuthenticated) return;
    if (!hasSubscription) {
      toast.info("Vui lòng mua gói để sử dụng tính năng này.");
      return;
    }

    const { sentenceIndex, selectedText, highlightNote } = contextMenu;

    const startIndex = 0;
    const endIndex = selectedText.length - 1;

    if (!selectedText) return;

    const highlightedSent = highlightedSentences.find(item => item.sentenceIndex === sentenceIndex);
    setUpdatingHighlight(true);

    if (highlightedSent) {
      // Remove the highlight
      try {
        const response = await axiosInstance.delete("/api/highlight/delete/" + highlightedSent.id);
        console.log("Delete highlight response:", response.data);

        const updatedHighlights = highlightedSentences.filter(item => item.id !== highlightedSent.id);
        setHighlightedSentences(updatedHighlights);
        toast.success("Highlight removed successfully!");
      } catch (error) {
        console.error('Error deleting highlight:', error.response ? error.response.data : error);
        toast.error("Failed to remove highlight.");
      }

    } else {
      // Add the highlight
      try {
        const requestBody = {
          recapVersionId: recapVersionId,
          userId: userId,
          note: highlightNote,
          targetText: selectedText,
          startIndex: startIndex.toString(),
          endIndex: endIndex.toString(),
          sentenceIndex: sentenceIndex.toString(),
        };

        const response = await axiosInstance.post('/api/highlight/createhighlight', requestBody);
        setHighlightedSentences([ ...highlightedSentences, response.data.data ]);
        toast.success("Highlight saved successfully!");
      } catch (error) {
        console.error('Error saving highlight:', error.response ? error.response.data : error);
        toast.error("Failed to save highlight.");
      }
    }
    setOpenCreateDialog(false);
    setUpdatingHighlight(false);
  };

  const handleContextMenu = (event, sentenceIndex, selectedText, isHighlighted, highlightNote) => {
    if (!isAuthenticated) return;
    if (cm.current) {
      setContextMenu({ selectedText, sentenceIndex, isHighlighted, highlightNote });
      cm.current.show(event);
    }
  };

  const handleCopy = () => {
    const { selectedText } = contextMenu;
    navigator.clipboard.writeText(selectedText)
      .then(() => {
        toast.success("Text copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy text to clipboard.");
      });
  };

  const items = [
    {
      label: contextMenu.isHighlighted ? "❌ Unhighlight" : "🖋️ Highlight",
      command: () => contextMenu.isHighlighted ? handleHighlight() : setOpenCreateDialog(true),
    },
    {
      label: "📋 Copy",
      command: () => handleCopy(),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {transcriptData.transcriptSections.map((section, index) => (
        <div key={index} className="rounded-lg bg-white shadow-[0px_0px_8px_rgba(0,0,0,0.1)]">
          {section.image && (
            <div className="relative h-40">
              <Image
                src={section.image}
                alt={section.title || "Section image"}
                className="w-full h-full rounded-t-lg overflow-hidden"
                imageClassName="object-cover w-full h-full"
                preview
              />
            </div>
          )}

          <div className="px-8 py-6">
            {section.title && <h3 className="font-bold text-gray-700 text-xl mb-3.5">{section.title}</h3>}

            {section.transcriptSentences.map((sentence, idx) => {
              const time = sentence.start;
              const sentenceIndex = String(sentence.sentence_index);
              const isHighlighted = highlightedSentences.some(item => item.sentenceIndex === sentenceIndex);
              const highlightNote = highlightedSentences.find(item => item.sentenceIndex === sentenceIndex)?.note || "";
              return (
                <Fragment key={idx}>
                  <Show when={isHighlighted && highlightNote}>
                    <Tooltip target={"#sentence-" + index + "-" + idx} position="top" autoHide={false}>
                      <p className="text-sm">{highlightNote?.trim()}</p>
                    </Tooltip>
                  </Show>
                  <span
                    id={"sentence-" + index + "-" + idx}
                    ref={el => {
                      sentenceRefs.current[sentenceIndex] = el
                    }}
                    data-start={sentence.start}
                    data-end={sentence.end}
                    onContextMenu={(e) => handleContextMenu(e, String(sentenceIndex), sentence.value.html, isHighlighted, highlightNote)}
                    onClick={() => {
                      if (isFinite(time)) handleSentenceClick(time);
                    }}
                    className={cn("transcript-sentence hover:bg-gray-300", {
                      "bg-orange-300 hover:bg-orange-300": activeSentenceIndex === sentenceIndex,
                      "bg-yellow-200": isHighlighted && activeSentenceIndex !== sentenceIndex,
                    })}
                  >{sentence.value.html}</span>
                </Fragment>
              );
            })}
          </div>
        </div>
      ))}

      <ContextMenu ref={cm} model={items}/>
      <Dialog
        visible={openCreateDialog}
        onHide={() => {
          if (updatingHighlight) return;
          setOpenCreateDialog(false)
        }}
        content={({ hide }) => (
          <Modal.Wrapper className="min-w-80">
            <Modal.Header title="Tạo highlight" onClose={hide}/>
            <div className="flex flex-col">
              <Modal.Body className="space-y-4">
                <p className="text-gray-700 text-sm">
                  Bạn đang tạo highlight cho câu:
                </p>

                <blockquote className="italic text-gray-600 my-2 p-2 bg-yellow-100 rounded-md">
                  <p>&#34;{contextMenu.selectedText}&#34;</p>
                </blockquote>

                <Divider/>

                <div className="flex flex-col gap-2">
                  <label htmlFor="note" className="block text-sm font-medium leading-6 text-gray-900">
                    Ghi chú (nếu có):
                  </label>
                  <InputText
                    id="note"
                    placeholder="Viết ghi chú cho highlight"
                    value={contextMenu.highlightNote}
                    onChange={(e) => setContextMenu({ ...contextMenu, highlightNote: e.target.value })}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer className="justify-end gap-3 text-sm">
                <button
                  className={cn(
                    "bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300",
                    { "opacity-50 cursor-not-allowed": updatingHighlight }
                  )}
                  type="button"
                  onClick={hide}
                  disabled={updatingHighlight}
                >
                  Hủy
                </button>
                <button
                  className="text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-progress"
                  disabled={updatingHighlight}
                  type="button"
                  onClick={handleHighlight}
                >
                  Lưu
                </button>
              </Modal.Footer>
            </div>
          </Modal.Wrapper>
        )}
      />
    </div>
  );
};

Transcriptv2.propTypes = {
  transcriptData: PropTypes.object.isRequired,
  // handleSentenceClick: PropTypes.func.isRequired,
  userId: PropTypes.string,
  recapVersionId: PropTypes.string.isRequired,
  isGenAudio: PropTypes.bool.isRequired,
  // currentTime: PropTypes.number.isRequired,
};

export default Transcriptv2;
