// import React, { useEffect, useState } from "react";
// import data from "../../data/read_along_output-final.json";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// import "./ReviewNote.scss";

// function ReviewNote() {
//   const { id } = useParams(); // Get the ID from URL params
//   const [comments, setComments] = useState([]); // Store comments
//   const [showInput, setShowInput] = useState(false); // Show/hide comment input
//   const [currentComment, setCurrentComment] = useState(""); // Current comment text
//   const [selectedIndex, setSelectedIndex] = useState(null); // Track selected sentence for comment
//   const [visibleComment, setVisibleComment] = useState(null); // Display comment
//   const [commentPosition, setCommentPosition] = useState({ top: 0, left: 0 }); // Position of the comment box

//   const [loading, setLoading] = useState(true);
//   const [content, setContent] = useState(null);

//   useEffect(() => {
//     const fetchContent = async () => {
//       try {
//         const response = await axios.get(
//           `https://66eb9ee32b6cf2b89c5b1714.mockapi.io/ContentItems/${id}`
//         );
//         setContent(response.data);
//       } catch (error) {
//         console.log("Error Fetching Content:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchContent();
//   }, [id]);

//   // Fetch comments when the component mounts
//   useEffect(() => {
//     const fetchComments = async () => {
//       try {
//         const response = await axios.get(
//           "https://66e3e75ed2405277ed124249.mockapi.io/noteData" // Assuming this is the API for comments
//         );
//         setComments(response.data);
//         console.log(response.data);

//       } catch (error) {
//         console.log("Error fetching comments:", error);
//       }
//     };

//     fetchComments();
//   }, []);

//   const handleRightClick = (e, section_index, sentence_index) => {
//     e.preventDefault(); // Prevent the default context menu
//     setSelectedIndex({ section_index, sentence_index });

//     const existingComment = comments.find(
//       (comment) =>
//         comment.section_index === section_index &&
//         comment.sentence_index === sentence_index
//     );

//     if (existingComment) {
//       setCurrentComment(existingComment.text); // Show existing comment
//     } else {
//       setCurrentComment(""); // Clear comment if new
//     }

//     setShowInput(true); // Show comment input box
//   };

//   // const handleAddComment = () => {
//   //   if (currentComment.trim()) {
//   //     const updatedComments = [...comments];
//   //     const commentIndex = comments.findIndex(
//   //       (comment) =>
//   //         comment.section_index === selectedIndex.section_index &&
//   //         comment.sentence_index === selectedIndex.sentence_index
//   //     );

//   //     if (commentIndex > -1) {
//   //       // Update existing comment
//   //       updatedComments[commentIndex].text = currentComment;
//   //     } else {
//   //       // Add new comment
//   //       updatedComments.push({
//   //         section_index: selectedIndex.section_index,
//   //         sentence_index: selectedIndex.sentence_index,
//   //         text: currentComment,
//   //       });
//   //     }

//   //     setComments(updatedComments);
//   //     setCurrentComment("");
//   //     setShowInput(false);
//   //   }
//   // };

//   const handleAddComment = async () => {
//     if (currentComment.trim()) {
//       const updatedComments = [...comments];
//       const commentIndex = comments.findIndex(
//         (comment) =>
//           comment.section_index === selectedIndex.section_index &&
//           comment.sentence_index === selectedIndex.sentence_index
//       );

//       const targetText = data.transcriptSections[selectedIndex.section_index].transcriptSentences[selectedIndex.sentence_index].value.html;

//       if (commentIndex > -1) {
//         // Update existing comment
//         updatedComments[commentIndex].feedback = currentComment;
//         updatedComments[commentIndex].target_index = targetText;

//         // Optionally send a PUT request to update
//         await axios.put(`https://66e3e75ed2405277ed124249.mockapi.io/noteData/${comments[commentIndex].id}`, {
//           feedback: currentComment,
//           target_text: targetText
//         });
//       } else {
//         // Add new comment
//         const newComment = {
//           section_index: selectedIndex.section_index,
//           sentence_index: selectedIndex.sentence_index,
//           feedback: currentComment,
//           target_text: targetText
//         };
//         updatedComments.push(newComment);
//         // Send a POST request to create a new comment
//         await axios.post("https://66e3e75ed2405277ed124249.mockapi.io/noteData", newComment);
//       }

//       setComments(updatedComments);
//       setCurrentComment("");
//       setShowInput(false);
//     }
//   };

//   const toggleCommentVisibility = (section_index, sentence_index, event) => {
//     const iconElement = event.target.getBoundingClientRect(); // Get icon position

//     // Calculate the position for the comment box
//     const topPosition = iconElement.top + window.scrollY - 40; // Adjust the top position (above the icon)
//     const leftPosition = iconElement.left + window.scrollX; // Position to the left of the icon

//     setCommentPosition({ top: topPosition, left: leftPosition });

//     if (
//       visibleComment &&
//       visibleComment.section_index === section_index &&
//       visibleComment.sentence_index === sentence_index
//     ) {
//       setVisibleComment(null); // Hide comment
//     } else {
//       setVisibleComment({ section_index, sentence_index }); // Show comment
//     }
//   };

//   if (loading) {
//     return <div style={{ marginLeft: 250 }}>Loading ...</div>;
//   }

//   if (!content) {
//     return (
//       <div style={{ marginLeft: 250 }}>
//         No content found for version number {id}
//       </div>
//     );
//   }

//   return (
//     <div style={{ marginLeft: 250 }}>
//       <h1>{content.title}</h1>
//       <p>{content.description}</p>
//       <p style={{ fontWeight: "bold" }}>Status: {content.status}</p>
//       <br />
//       <div>
//         {data.transcriptSections.map((section, section_index) => (
//           <div key={section_index}>
//             {section.transcriptSentences.map((sentence, sentence_index) => {
//               const hasComment = comments.find(
//                 (comment) =>
//                   comment.section_index === section_index &&
//                   comment.sentence_index === sentence_index &&
//                   comment.feedback
//               );

//               return (
//                 <span
//                   key={sentence_index}
//                   id={`word-${section_index}-${sentence_index}`}
//                   onContextMenu={(e) =>
//                     handleRightClick(e, section_index, sentence_index)
//                   }
//                   style={{ cursor: "pointer", marginRight: "4px" }}
//                 >
//                   {sentence.value.html + " "}
//                   {hasComment && (
//                     <span
//                       style={{ marginLeft: "2px", color: "#00aaff" }}
//                       onClick={(e) =>
//                         toggleCommentVisibility(section_index, sentence_index, e)
//                       }
//                     >
//                       💬
//                     </span>
//                   )}
//                 </span>
//               );
//             })}
//           </div>
//         ))}
//       </div>

//       {showInput && (
//         <div>
//           <textarea
//             value={currentComment}
//             onChange={(e) => setCurrentComment(e.target.value)}
//             placeholder="Add a comment"
//           />
//           <button onClick={handleAddComment}>Add Comment</button>
//           <button onClick={() => setShowInput(false)}>Cancel</button>
//         </div>
//       )}

//       {visibleComment && (
//         <div
//           style={{
//             position: "absolute",
//             background: "aqua",
//             padding: "5px",
//             border: "1px solid #ccc",
//             top: commentPosition.top, // Use calculated top position
//             left: commentPosition.left, // Use calculated left position
//             zIndex: 1,
//             color: "black",
//             width: "150px",
//           }}
//         >
//           <p>
//             {comments.find(
//               (comment) =>
//                 comment.section_index === visibleComment.section_index &&
//                 comment.sentence_index === visibleComment.sentence_index
//             )?.feedback}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ReviewNote;

import React, { useEffect, useState } from "react";
import data from "../../data/read_along_output-final.json";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Hourglass } from "react-loader-spinner";

import "./ReviewNote.scss";

function ReviewNote() {
  const { id } = useParams(); // Get the ID from URL params
  const [comments, setComments] = useState([]); // Store comments
  const [showInput, setShowInput] = useState(false); // Show/hide comment input
  const [currentComment, setCurrentComment] = useState(""); // Current comment text
  const [selectedIndex, setSelectedIndex] = useState(null); // Track selected sentence for comment
  const [visibleComment, setVisibleComment] = useState(null); // Display comment
  const [commentPosition, setCommentPosition] = useState({ top: 0, left: 0 }); // Position of the comment box

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

  // Fetch comments when the component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          "https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback" // Assuming this is the API for comments
        );
        const commentsData = response.data[0]?.comments || []; // Adjust to match new structure
        setComments(commentsData);
        console.log(commentsData);
      } catch (error) {
        console.log("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, []);

  const handleRightClick = (e, sectionIndex, sentenceIndex) => {
    e.preventDefault(); // Prevent the default context menu
    setSelectedIndex({ sectionIndex, sentenceIndex });

    const existingComment = comments.find(
      (comment) =>
        comment.section_index === sectionIndex &&
        comment.sentence_index === sentenceIndex
    );

    if (existingComment) {
      setCurrentComment(existingComment.feedback); // Show existing comment
    } else {
      setCurrentComment(""); // Clear comment if new
    }

    setShowInput(true); // Show comment input box
  };

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
        setCurrentComment(""); // Xóa nội dung ô nhập comment
        setShowInput(false); // Ẩn ô nhập comment
      } catch (error) {
        console.error("Error updating comments:", error);
      }
    }
  };

  const toggleCommentVisibility = (sectionIndex, sentenceIndex, event) => {
    const iconElement = event.target.getBoundingClientRect(); // Get icon position

    // Calculate the position for the comment box
    const topPosition = iconElement.top + window.scrollY + 20; // Adjust the top position (above the icon)
    const leftPosition = iconElement.left + window.scrollX; // Position to the left of the icon

    setCommentPosition({ top: topPosition, left: leftPosition });

    if (
      visibleComment &&
      visibleComment.section_index === sectionIndex &&
      visibleComment.sentence_index === sentenceIndex
    ) {
      setVisibleComment(null); // Hide comment
    } else {
      setVisibleComment({
        section_index: sectionIndex,
        sentence_index: sentenceIndex,
      }); // Show comment
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
            {section.transcriptSentences.map((sentence, sentenceIndex) => {
              const hasComment = comments.find(
                (comment) =>
                  comment.section_index === sectionIndex &&
                  comment.sentence_index === sentenceIndex &&
                  comment.feedback
              );

              return (
                <span
                  key={sentenceIndex}
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
                        toggleCommentVisibility(sectionIndex, sentenceIndex, e)
                      }
                    >
                      💬
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {showInput && (
        <div>
          <textarea
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
            placeholder="Add a comment"
          />
          <button onClick={handleAddComment}>Add Comment</button>
          <button onClick={() => setShowInput(false)}>Cancel</button>
        </div>
      )}

      {visibleComment && (
        <div
          style={{
            position: "absolute",
            background: "aqua",
            padding: "5px",
            border: "1px solid #ccc",
            top: commentPosition.top, // Use calculated top position
            left: commentPosition.left, // Use calculated left position
            zIndex: 1,
            color: "black",
            width: "150px",
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
      )}
    </div>
  );
}

export default ReviewNote;
