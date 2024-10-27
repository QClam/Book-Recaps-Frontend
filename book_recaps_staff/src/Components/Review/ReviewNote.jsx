import React, { useEffect, useState } from "react";
import data from "../../data/read_along_output-final.json";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Hourglass } from "react-loader-spinner";

import "./ReviewNote.scss";

function ReviewNote() {
  const { id } = useParams(); // Lấy id từ URL params
  const [comments, setComments] = useState([]); // Lưu comment vào state
  const [showInput, setShowInput] = useState(false); // Ẩn/hiện ô nhập comment
  const [currentComment, setCurrentComment] = useState(""); // Lấy comment trong ô input
  const [selectedIndex, setSelectedIndex] = useState(null); // Lấy sentence cần comment
  const [visibleComment, setVisibleComment] = useState(null); // Ẩn/hiện comment
  const [commentPosition, setCommentPosition] = useState({ top: 0, left: 0 }); // Vị trí của comment

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);

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

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          "https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback"
        );
        const commentsData = response.data[0]?.comments || [];
        setComments(commentsData);
        console.log(commentsData);
      } catch (error) {
        console.log("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, []);

  const handleRightClick = (e, sectionIndex, sentenceIndex) => {
    e.preventDefault(); // Chặn menu chuột phải mặc định
    setSelectedIndex({ sectionIndex, sentenceIndex });

    const existingComment = comments.find(
      (comment) =>
        comment.section_index === sectionIndex &&
        comment.sentence_index === sentenceIndex
    );

    if (existingComment) {
      setCurrentComment(existingComment.feedback); // Nếu có comment thì hiện trong ô input
    } else {
      setCurrentComment("");
    }

    setShowInput(true); // Hiển thị ô nhập comment
  };


  // Thêm nhận xét
  const handleAddComment = async () => {
    if (currentComment.trim()) {
      const contentId = id; // Lấy ID hiện tại

      try {
        // Lấy dữ liệu hiện tại từ API
        const response = await axios.get(
          `https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback/${contentId}`
        );
        const currentData = response.data;

        // Sao chép các comment hiện tại
        const updatedComments = [...currentData.comments];
        const commentIndex = updatedComments.findIndex(
          (comment) =>
            comment.section_index === selectedIndex.sectionIndex &&
            comment.sentence_index === selectedIndex.sentenceIndex
        );

        // Lấy câu đã chọn
        const selectedSentence =
          data.transcriptSections[selectedIndex.sectionIndex]
            ?.transcriptSentences[selectedIndex.sentenceIndex];

        // Kiểm tra dữ liệu từ selectedSentence
        if (!selectedSentence) {
          console.error(
            "Selected sentence is undefined. Check the structure of data."
          );
          return;
        }

        // Lấy nội dung câu và chỉ số bắt đầu/kết thúc
        const targetText = selectedSentence.value.html;
        const startIndex = 0; // Vị trí đầu tiên của câu
        const endIndex = targetText.length - 1; // Vị trí cuối cùng của câu

        if (commentIndex > -1) {
          // Cập nhật comment hiện tại
          updatedComments[commentIndex].feedback = currentComment;
          updatedComments[commentIndex].target_text = targetText;
          updatedComments[commentIndex].start_index = startIndex;
          updatedComments[commentIndex].end_index = endIndex;
        } else {
          // Thêm comment mới
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

        // Gửi PUT request để cập nhật dữ liệu
        await axios.put(
          `https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback/${contentId}`,
          {
            ...currentData,
            comments: updatedComments,
          }
        );

        setComments(updatedComments); // Cập nhật state với comment mới
        setCurrentComment("");
        setShowInput(false);
      } catch (error) {
        console.error("Error updating comments:", error);
      }
    }
  };

  // Xóa nhận xét
  const handleDeleteComment = async (sectionIndex, sentenceIndex) => {
    const contentId = id;

    try {
      const response = await axios.get(
        `https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback/${contentId}`
      );
      const currentData = response.data;

      // Lọc ra các comment không phải là comment cần xóa, filter dùng để lọc các comment hiện có
      //  nếu có thì loại khỏi danh sách cần xóa
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
      setVisibleComment(false)
    } catch (error) {
      console.log("Error Deleting comment", error);
    }
  };

  const toggleCommentVisibility = (sectionIndex, sentenceIndex, event) => {
    const iconElement = event.target.getBoundingClientRect(); // Lấy vị trí icon

    const topPosition = iconElement.bottom + window.scrollY; // vị trí dưới icon
    const leftPosition = iconElement.left + window.scrollX; // vị trí trái icon

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
    <div>
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
                <>
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
                </>
              )}
            </span>

            {/* Hiển thị ô nhập comment dưới câu được chọn */}
            {showInput &&
              selectedIndex &&
              selectedIndex.sectionIndex === sectionIndex &&
              selectedIndex.sentenceIndex === sentenceIndex && (
                <div>
                  <textarea
                    value={currentComment}
                    onChange={(e) => setCurrentComment(e.target.value)}
                    placeholder="Add a comment"
                    style={{
                      width: "50%",
                      height: 60,
                      marginTop: 10,
                      // backgroundColor: "#f1f1f1"
                    }}
                  />
                  <div style={{ marginBottom: 10 }}>
                    <button
                      onClick={handleAddComment}
                      style={{ marginRight: 10, backgroundColor: "#007bff" }}
                    >
                      Add Comment
                    </button>
                    <button onClick={() => setShowInput(false)} style={{backgroundColor: "red"}}>Cancel</button>
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

      
      {visibleComment && (
        <div>
          <div
            style={{
              position: "absolute",
              background: "aqua",
              padding: "5px",
              border: "1px solid #ccc",
              top: commentPosition.top + 15,
              left: commentPosition.left,
              zIndex: 1,
              color: "black",
              width: "auto",
            }}
          >
            <p>
              {
                comments.find(
                  (comment) =>
                    comment.section_index === visibleComment.section_index &&
                    comment.sentence_index === visibleComment.sentence_index
                )?.feedback
              }
            </p>
          </div>
          <button
            onClick={() =>
              handleDeleteComment(
                visibleComment.section_index,
                visibleComment.sentence_index
              )
            }
            style={{
              marginTop: "5px", backgroundColor: "red", color: "white", position: "absolute",
              padding: "5px",
              top: commentPosition.top + 50,
              left: commentPosition.left,
              zIndex: 1,
              width: "auto",
            }}
          >
            Xóa
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewNote;
