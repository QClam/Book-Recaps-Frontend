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

import { ref, onValue, set, update } from "firebase/database";
import { database } from '../../firebase'; // adjust the path as necessary

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
        // Fetch the current object (assumed to be by ID `1` or dynamic based on your setup)
        const contentId = id; // You can replace this with the actual ID logic if needed
        try {
            const response = await axios.get(`https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback/${contentId}`);
            const currentData = response.data;

            const updatedComments = [...currentData.comments];
            const commentIndex = updatedComments.findIndex(
                (comment) =>
                    comment.section_index === selectedIndex.sectionIndex &&
                    comment.sentence_index === selectedIndex.sentenceIndex
            );

            const targetText = data.transcriptSections[selectedIndex.sectionIndex].transcriptSentences[selectedIndex.sentenceIndex].value.html;

            if (commentIndex > -1) {
                // Update existing comment
                updatedComments[commentIndex].feedback = currentComment;
                updatedComments[commentIndex].target_text = targetText;
            } else {
                // Add new comment to the comments array
                const newComment = {
                    section_index: selectedIndex.sectionIndex,
                    sentence_index: selectedIndex.sentenceIndex,
                    feedback: currentComment,
                    target_text: targetText,
                    start_index: data.transcriptSections[selectedIndex.sectionIndex].transcriptSentences[selectedIndex.sentenceIndex].value.start,
                    end_index: data.transcriptSections[selectedIndex.sectionIndex].transcriptSentences[selectedIndex.sentenceIndex].value.end
                };
                updatedComments.push(newComment);
            }

            // Send a PUT request to update the entire object with the updated comments array
            await axios.put(`https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback/${contentId}`, {
                ...currentData,
                comments: updatedComments // Update the comments array in the object
            });

            setComments(updatedComments); // Update local state with the new comments
            setCurrentComment(""); // Clear comment input
            setShowInput(false); // Hide input field

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
      setVisibleComment({ section_index: sectionIndex, sentence_index: sentenceIndex }); // Show comment
    }
  };

  if (loading) {
    return <div style={{ marginLeft: 250 }}>Loading ...</div>;
  }

  if (!content) {
    return (
      <div style={{ marginLeft: 250 }}>
        No content found for version number {id}
      </div>
    );
  }

  return (
    <div style={{ marginLeft: 250 }}>
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
            {comments.find(
              (comment) =>
                comment.section_index === visibleComment.section_index &&
                comment.sentence_index === visibleComment.sentence_index
            )?.feedback}
          </p>
        </div>
      )}
    </div>
  );
}

export default ReviewNote;
