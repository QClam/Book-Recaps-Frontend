import React, { useEffect, useState } from "react";
import data from "../../data/read_along_output-final.json";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Hourglass } from "react-loader-spinner";
import "./ReviewNote.scss";

function ReviewNote() {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [currentComment, setCurrentComment] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [visibleComment, setVisibleComment] = useState(null);
  const [commentPosition, setCommentPosition] = useState({ top: 0, left: 0 });

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const [contentItem, setContentItem] = useState(null);

  const token = localStorage.getItem("access_token")

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          `https://66eb9ee32b6cf2b89c5b1714.mockapi.io/ContentItems/${id}`
        );
        setContent(response.data);
      } catch (error) {
        console.log("Error Fetching Content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          "https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback"
        );
        const commentsData = response.data[0]?.comments || [];
        setComments(commentsData);
      } catch (error) {
        console.log("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, []);

  const handleRightClick = (e, sectionIndex, sentenceIndex) => {
    e.preventDefault();
    setSelectedIndex({ sectionIndex, sentenceIndex });

    const existingComment = comments.find(
      (comment) =>
        comment.section_index === sectionIndex &&
        comment.sentence_index === sentenceIndex
    );

    if (existingComment) {
      setCurrentComment(existingComment.feedback);
    } else {
      setCurrentComment("");
    }

    setShowInput(true);
  };

  const handleAddComment = async () => {
    if (currentComment.trim()) {
      const contentId = id;

      try {
        const response = await axios.get(
          `https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback/${contentId}`
        );
        const currentData = response.data;
        const updatedComments = [...currentData.comments];
        const commentIndex = updatedComments.findIndex(
          (comment) =>
            comment.section_index === selectedIndex.sectionIndex &&
            comment.sentence_index === selectedIndex.sentenceIndex
        );

        const selectedSentence =
          data.transcriptSections[selectedIndex.sectionIndex]
            ?.transcriptSentences[selectedIndex.sentenceIndex];

        if (!selectedSentence) {
          console.error(
            "Selected sentence is undefined. Check the structure of data."
          );
          return;
        }

        const targetText = selectedSentence.value.html;
        const startIndex = 0;
        const endIndex = targetText.length - 1;

        if (commentIndex > -1) {
          updatedComments[commentIndex].feedback = currentComment;
          updatedComments[commentIndex].target_text = targetText;
          updatedComments[commentIndex].start_index = startIndex;
          updatedComments[commentIndex].end_index = endIndex;
        } else {
          const newComment = {
            section_index: selectedIndex.sectionIndex,
            sentence_index: selectedIndex.sentenceIndex,
            feedback: currentComment,
            target_text: targetText,
            start_index: startIndex,
            end_index: endIndex,
          };
          updatedComments.push(newComment);
        }

        await axios.put(
          `https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback/${contentId}`,
          {
            ...currentData,
            comments: updatedComments,
          }
        );

        setComments(updatedComments);
        setCurrentComment("");
        setShowInput(false);
      } catch (error) {
        console.error("Error updating comments:", error);
      }
    }
  };

  const handleDeleteComment = async (sectionIndex, sentenceIndex) => {
    const contentId = id;

    try {
      const response = await axios.get(
        `https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback/${contentId}`
      );
      const currentData = response.data;

      const updatedComments = currentData.comments.filter(
        (comment) =>
          !(
            comment.section_index === sectionIndex &&
            comment.sentence_index === sentenceIndex
          )
      );
      await axios.put(
        `https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback/${contentId}`,
        { ...currentData, comments: updatedComments }
      );
      setComments(updatedComments);
      setVisibleComment(false);
    } catch (error) {
      console.log("Error Deleting comment", error);
    }
  };

  const toggleCommentVisibility = (sectionIndex, sentenceIndex, event) => {
    const iconElement = event.target.getBoundingClientRect();

    const topPosition = iconElement.bottom + window.scrollY;
    const leftPosition = iconElement.left + window.scrollX;

    setCommentPosition({ top: topPosition, left: leftPosition });

    if (
      visibleComment &&
      visibleComment.section_index === sectionIndex &&
      visibleComment.sentence_index === sentenceIndex
    ) {
      setVisibleComment(null);
    } else {
      setVisibleComment({
        section_index: sectionIndex,
        sentence_index: sentenceIndex,
      });
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <Hourglass
          visible={true}
          height="80"
          width="80"
          ariaLabel="hourglass-loading"
          wrapperStyle={{}}
          wrapperClass=""
          colors={["#306cce", "#72a1ed"]}
        />
      </div>
    );
  }

  if (!content) {
    return (
      <div style={{ marginLeft: 250 }}>
        No content found for version number {id}
      </div>
    );
  }

  return (
    <div className="audio-grid">
      <div className="transcript-container">
        <div className="transcript-box">
          <div className="transcript">
            <h1>{content.title}</h1>
            <p>{content.description}</p>
            <p style={{ fontWeight: "bold" }}>Status: {content.status}</p>
            <br />
            <div>
              {data.transcriptSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <span>
                    {section.transcriptSentences.map((sentence, sentenceIndex) => {
                      const hasComment = comments.find(
                        (comment) =>
                          comment.section_index === sectionIndex &&
                          comment.sentence_index === sentenceIndex &&
                          comment.feedback
                      );

                      return (
                        <span key={sentenceIndex}>
                          <span
                            id={`word-${sectionIndex}-${sentenceIndex}`}
                            onContextMenu={(e) =>
                              handleRightClick(e, sectionIndex, sentenceIndex)
                            }
                            style={{ cursor: "pointer", marginRight: "4px" }}
                          >
                            {sentence.value.html + " "}
                            {hasComment && (
                              <span
                                style={{ marginLeft: "2px", color: "#00aaff" }}
                                onClick={(e) =>
                                  toggleCommentVisibility(
                                    sectionIndex,
                                    sentenceIndex,
                                    e
                                  )
                                }
                              >
                                💬
                              </span>
                            )}
                          </span>

                          {showInput &&
                            selectedIndex &&
                            selectedIndex.sectionIndex === sectionIndex &&
                            selectedIndex.sentenceIndex === sentenceIndex && (
                              <div>
                                <textarea
                                  value={currentComment}
                                  onChange={(e) => setCurrentComment(e.target.value)}
                                  placeholder="Add a comment"
                                  className="comment-input"
                                />
                                <div style={{ marginBottom: 10 }}>
                                  <button
                                    onClick={handleAddComment}
                                    className="add-button"
                                  >
                                    Add Comment
                                  </button>
                                  <button
                                    onClick={() => setShowInput(false)}
                                    className="cancel-button"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                        </span>
                      );
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="staff-comments-side">
        <div className="staff-comments">
          <h3>Staff Comments</h3>
          <div className="comment">
            <p>Staff Name</p>
            <p>6:38 PM Today</p>
            <p>Sample comment...</p>
          </div>
          <div className="comment">
            <p>Staff Name</p>
            <p>6:38 PM Today</p>
            <p>Sample comment...</p>
          </div>
          <div className="summary-note">
            <h4>Ghi chú tổng:</h4>
            <textarea placeholder="Ghi chú ở đây..." className="comment-input"></textarea>
            <div className="status-buttons">
              <button className="not-achieved">Chưa đạt</button>
              <button className="achieved">Đạt</button>
            </div>
          </div>
        </div>
      </div>

      {visibleComment && (
        <div
          style={{
            position: "absolute",
            background: "aqua",
            padding: "4px",
            top: commentPosition.top,
            left: commentPosition.left,
            zIndex: 1,
          }}
        >
          <p>{comments.find(
            (comment) =>
              comment.section_index === visibleComment.section_index &&
              comment.sentence_index === visibleComment.sentence_index
          ).feedback}</p>
          <button
            className="delete-button"
            onClick={() =>
              handleDeleteComment(
                visibleComment.section_index,
                visibleComment.sentence_index
              )
            }
          >
            Delete Comment
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewNote;
