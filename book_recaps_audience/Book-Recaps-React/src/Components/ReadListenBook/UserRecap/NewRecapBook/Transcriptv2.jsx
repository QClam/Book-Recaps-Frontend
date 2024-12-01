import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ContextMenu } from "primereact/contextmenu";
import { axiosInstance } from "../../../../utils/axios";
import { cn } from "../../../../utils/cn";
import { Image } from "primereact/image";
import { useAuth } from "../../../../contexts/Auth";

const initialContextMenu = {
  selectedText: '',
  sentenceIndex: null,
  isHighlighted: false,
}

const Transcriptv2 = ({ transcriptData, handleSentenceClick, userId, recapVersionId, isGenAudio, currentTime }) => {
  const { isAuthenticated } = useAuth();
  const [ contextMenu, setContextMenu ] = useState(initialContextMenu);
  const [ activeSentenceIndex, setActiveSentenceIndex ] = useState(null);
  const [ highlightedSentences, setHighlightedSentences ] = useState([]);

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

  const handleHighlight = async () => {
    const { sentenceIndex, selectedText } = contextMenu;
    const startIndex = 0;
    const endIndex = selectedText.length - 1;

    if (!selectedText) return;

    const highlightedSent = highlightedSentences.filter(item => item.sentenceIndex === sentenceIndex);

    if (highlightedSent.length > 0) {
      // Remove the highlight
      try {
        const response = await axiosInstance.delete("/api/highlight/delete/" + highlightedSent[0].id);
        console.log("Delete highlight response:", response.data);

        const updatedHighlights = highlightedSentences.filter(item => item.id !== highlightedSent[0].id);
        setHighlightedSentences(updatedHighlights);
        alert("Highlight removed successfully!");
      } catch (error) {
        console.error('Error deleting highlight:', error.response ? error.response.data : error);
        alert("Failed to remove highlight.");
      }

    } else {
      // Add the highlight
      try {
        const requestBody = {
          recapVersionId: recapVersionId,
          userId: userId,
          note: "",
          targetText: selectedText,
          startIndex: startIndex.toString(),
          endIndex: endIndex.toString(),
          sentenceIndex: sentenceIndex.toString(),
        };

        const response = await axiosInstance.post('/api/highlight/createhighlight', requestBody);
        setHighlightedSentences([ ...highlightedSentences, response.data.data ]);
        alert("Highlight saved successfully!");
      } catch (error) {
        console.error('Error saving highlight:', error.response ? error.response.data : error);
        alert("Failed to save highlight.");
      }
    }
  };

  const handleContextMenu = (event, sentenceIndex, selectedText, isHighlighted) => {
    if (!isAuthenticated) return;
    if (cm.current) {
      setContextMenu({ selectedText, sentenceIndex, isHighlighted });
      cm.current.show(event);
    }
  };

  const handleCopy = () => {
    const { selectedText } = contextMenu;
    navigator.clipboard.writeText(selectedText)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        alert("Failed to copy text.");
      });
  };

  const items = [
    {
      label: contextMenu.isHighlighted ? "🧽 Unhighlight" : "🖋️ Highlight",
      command: () => handleHighlight(),
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
              return (
                <span
                  key={idx}
                  id={"sentence-" + index + "-" + idx}
                  ref={el => {
                    sentenceRefs.current[sentenceIndex] = el
                  }}
                  data-start={sentence.start}
                  data-end={sentence.end}
                  onContextMenu={(e) => handleContextMenu(e, String(sentenceIndex), sentence.value.html, isHighlighted)}
                  onClick={() => {
                    if (isFinite(time)) handleSentenceClick(time);
                  }}
                  className={cn("transcript-sentence hover:bg-gray-300", {
                    "bg-orange-300": activeSentenceIndex === sentenceIndex,
                    "bg-yellow-200": isHighlighted && activeSentenceIndex !== sentenceIndex,
                  })}
                >
                {sentence.value.html}
              </span>
              );
            })}
          </div>
        </div>
      ))}

      <ContextMenu ref={cm} model={items} onHide={() => setContextMenu(initialContextMenu)}/>
    </div>
  );
};

Transcriptv2.propTypes = {
  transcriptData: PropTypes.object.isRequired,
  handleSentenceClick: PropTypes.func.isRequired,
  userId: PropTypes.string,
  recapVersionId: PropTypes.string.isRequired,
  isGenAudio: PropTypes.bool.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default Transcriptv2;
